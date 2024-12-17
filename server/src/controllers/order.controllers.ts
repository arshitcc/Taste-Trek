import { asyncHandler } from "../utils/asyncHandler";
import { Response } from "express";
import { CustomRequest } from "../models/users.model";
import { IOrder, Order, OrderStatus, PaymentMethod, PaymentStatus, ICartItem } from "../models/orders.model";
import { Restaurant } from "../models/restaurants.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { isValidObjectId } from "mongoose";
import { IAddress } from "../models/users.model";
import { FoodItem } from "../models/food.model";
import mongoose from "mongoose";

const initiateOrder = asyncHandler(async (req: CustomRequest, res: Response) => {

  const {restaurantId} = req.params;

  if(!isValidObjectId(restaurantId)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if(!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }  

  const {items, totalAmount, deliveryAddress, paymentMethod, paymentStatus, preparationTime, isGift, specialInstructions} : IOrder = req.body;
  const {street, city, state, country, pincode} : IAddress = deliveryAddress; 
  
  if(items.length === 0) {
    throw new ApiError(400, "Items are required");
  }

  for(let item of items) {
    
    const {foodId, name, price, quantity, maxQuantity} : ICartItem = item;
    if(!isValidObjectId(foodId)) {
      throw new ApiError(400, "Invalid item ID");
    }

    if(!name?.trim() || (!price || price<=0) || (!quantity || quantity<=0)) {
      throw new ApiError(400, "Invalid item details");
    }

    if(quantity > maxQuantity){
      throw new ApiError(400, "Invalid quantity");
    }

    const foodItem = await FoodItem.findById(foodId);
    if(!foodItem) {
      throw new ApiError(404, "Food item not found");
    }
    if(foodItem.restaurantId.toString() !== restaurantId) {
      throw new ApiError(400, "Food item does not belong to this restaurant");
    }
  }  

  if([street, city, state, country, pincode, paymentMethod, paymentStatus ].some((field) => (!field || field?.trim() === "")) ||
    isGift === undefined || (!preparationTime || preparationTime<=0) || (!totalAmount || totalAmount<=0)
  ) {
    throw new ApiError(400, "Provide necessary fields to create an order");
  }

  if(paymentMethod === PaymentMethod.CASH && paymentStatus === PaymentStatus.PAID) {
    throw new ApiError(400, "Payment status cannot be paid when payment method is cash");
  }

  const estTime = new Date(Date.now());
  estTime.setMinutes(estTime.getMinutes()+preparationTime);

  const order = await Order.create({
    userId : req.user._id,
    restaurantId,
    items,
    totalAmount,
    deliveryAddress,
    orderPlacedAt : Date.now(),
    estimatedDeliveryTime : estTime,
    paymentMethod,
    paymentStatus,
    preparationTime,
    isGift,
    specialInstructions
  });  

  if(!order) {
    throw new ApiError(500, "Failed to create order");
  }

  return res.status(201)
  .json(new ApiResponse(201, "Order placed successfully", order));
});

const updateOrderByRestaurant = asyncHandler(async (req: CustomRequest, res: Response) => {
  const {orderId, restaurantId} = req.params;
  if(!isValidObjectId(orderId) || !isValidObjectId(restaurantId)) {
    throw new ApiError(400, "Invalid order ID or restaurant ID");
  }

  const order = await Order.findById(orderId);
  if(!order) {
    throw new ApiError(404, "Order not found");
  }

  if(order.restaurantId.toString() !== restaurantId) {
    throw new ApiError(403, "You are not authorized to update this order");
  }

  if(order.status === OrderStatus.DELIVERED) {
    throw new ApiError(400, "Order is already delivered");
  }

  if(order.status === OrderStatus.CANCELLED) {
    throw new ApiError(400, "Order is already cancelled");
  }   

  const {status} : {status : OrderStatus} = req.body;
  if(!status || !Object.values(OrderStatus).includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  if(status === OrderStatus.DELIVERED) {
    throw new ApiError(400, "You cannot mark a order as delivered");
  }
  
  if(status === OrderStatus.PENDING) {
    throw new ApiError(400, "You cannot mark a order as pending");
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId, {
    $set : {
      status
    }
  }, {new : true});

  if(!updatedOrder) {
    throw new ApiError(500, "Failed to update order");
  }

  return res.status(200)
  .json(new ApiResponse(200, "Order updated successfully", updatedOrder));
});

const updateOrderByUser = asyncHandler(async (req: CustomRequest, res: Response) => {
    const {orderId} = req.params;
    if(!isValidObjectId(orderId)) {
      throw new ApiError(400, "Invalid order ID");
    }

    const order = await Order.findById(orderId);
    if(!order) {
      throw new ApiError(404, "Order not found");
    }

    if(order.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this order");
    }

    if(order.status === OrderStatus.DELIVERED) {
      throw new ApiError(400, "Order is already delivered");
    }

    if(order.status === OrderStatus.CANCELLED) {
      throw new ApiError(400, "Order is already cancelled");
    }

    const {specialInstructions} : {specialInstructions : string} = req.body;

    if(!specialInstructions?.trim()) {
      throw new ApiError(400, "Special instructions are required");
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      $set : {
        specialInstructions
      }
    }, {new : true});

    if(!updatedOrder) {
      throw new ApiError(500, "Failed to update order");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Order updated successfully", updatedOrder));

});

const completeOrder = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { orderId } = req.params;

    if(!isValidObjectId(orderId)) {
      throw new ApiError(400, "Invalid order ID or delivery partner ID");
    }

    const order = await Order.findById(orderId);
    if(!order) {
      throw new ApiError(404, "Order not found");
    }

    if(order.deliveryPartnerId?.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to complete this order");
    }   

    if(order.status === OrderStatus.DELIVERED) {
      throw new ApiError(400, "Order is already delivered");
    }

    if(order.status !== OrderStatus.CONFIRMED) {
      throw new ApiError(400, "Order is not confirmed");
    }

    const {deliveryRating, actualDeliveryTime} : {deliveryRating : number, actualDeliveryTime : Date} = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      $set: {
        status: OrderStatus.DELIVERED,
        actualDeliveryTime,
        deliveryPartnerID : req.user._id,
        deliveryRating : deliveryRating ? deliveryRating : 0
      }
    }, { new: true });

    if(!updatedOrder) {
      throw new ApiError(500, "Failed to complete order");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Order completed successfully", updatedOrder));
});

const cancelOrderByRestaurant = asyncHandler(async (req: CustomRequest, res: Response) => {
  const {orderId, restaurantId} = req.params;
  if(!isValidObjectId(orderId) || !isValidObjectId(restaurantId)) {
    throw new ApiError(400, "Invalid order ID or restaurant ID");
  }

  const order = await Order.findById(orderId);
  if(!order) {
    throw new ApiError(404, "Order not found");
  }   

  if(order.restaurantId.toString() !== restaurantId) {
    throw new ApiError(403, "You are not authorized to cancel this order");
  }

  if(order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED || order.status === OrderStatus.OUT_FOR_DELIVERY) {
    throw new ApiError(400, "Order is already delivered or cancelled or confirmed");
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId, {
    $set : {
      status : OrderStatus.CANCELLED
    }
  }, {new : true}); 

  if(!updatedOrder) { 
    throw new ApiError(500, "Failed to cancel order");
  }

  return res.status(200)
  .json(new ApiResponse(200, "Order cancelled successfully", updatedOrder));
});

const cancelOrderByUser = asyncHandler(async (req: CustomRequest, res: Response) => {
  const {orderId} = req.params;
  if(!isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findById(orderId);
  if(!order) {
    throw new ApiError(404, "Order not found");
  }

  if(order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this order");
  }

  if(order.status === OrderStatus.DELIVERED) {
    throw new ApiError(400, "Order is already delivered");
  }
  if(order.status === OrderStatus.CANCELLED) {
    throw new ApiError(400, "Order is already cancelled");
  }

  if(order.status === OrderStatus.PREPARING || order.status === OrderStatus.CONFIRMED) {
    throw new ApiError(400, "Order is already being prepared and cannot be cancelled. We can still give you a partial refund for the items that are not prepared yet.");
  }

  const {cancellationReason} : {cancellationReason : string} = req.body;
  if(!cancellationReason?.trim()) {
    throw new ApiError(400, "Cancellation reason is required");
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId, {
    $set : {
      status : OrderStatus.CANCELLED,
      cancellationReason
    }
  }, {new : true});

  if(!updatedOrder) {
    throw new ApiError(500, "Failed to cancel order");
  }

  return res.status(200)
  .json(new ApiResponse(200, "Order cancelled successfully", updatedOrder));
});

const getUserOrders = asyncHandler(async (req: CustomRequest, res: Response) => {
  const orders = await Order.aggregate([
    {
      $match : {
        userId : req.user._id,
      },
    },
    {
      $sort : {
        orderPlacedAt : -1
      }
    },
    {
      $lookup : {
        from : "restaurants",
        localField : "restaurantId",
        foreignField : "_id",
        as : "restaurant",
        pipeline : [
          {
            $project : {
              _id : 1,
              name : 1,
              address : 1
            }
          }
        ]
      }
    },
    {
      $unwind : "$restaurant"
    }
  ]);

  if(!orders) {
    throw new ApiError(500, "Failed to fetch orders");
  }

  return res.status(200)
  .json(new ApiResponse(200, "Orders fetched successfully", orders));
});

const getRestaurantOrders = asyncHandler(async (req: CustomRequest, res: Response) => {
  const {restaurantId} = req.params;
  if(!isValidObjectId(restaurantId)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  // this pipeline is not tested yet
  const orders = await Order.aggregate([
    {
      $match : {
        restaurantId : new mongoose.Types.ObjectId(restaurantId)
      }
    },
    {
      $sort : {
        orderPlacedAt : -1
      }
    },
    {
      $lookup : {
        from : "users",
        localField : "userId",
        foreignField : "_id",
        as : "orderedBy",
        pipeline : [
          {
            $project : {
              _id : 1,
              name : 1,
              phone : 1
            }
          }
        ]
      }
    },
    {
      $unwind : "$orderedBy"
    }
  ]);

  if(!orders) {
    throw new ApiError(500, "Failed to fetch orders");
  }

  return res.status(200)
  .json(new ApiResponse(200, "Orders fetched successfully", orders));
});

const getOrderDetails = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { orderId } = req.params;

    if(!isValidObjectId(orderId)) {
      throw new ApiError(400, "Invalid order ID");
    }

    const order = await Order.findById(orderId);
    if(!order) {
      throw new ApiError(404, "Order not found");
    }

    if(order.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to view this order");
    }

    const orderDetails = await Order.aggregate([
      {
        $match : {
          _id : new mongoose.Types.ObjectId(orderId)
        }
      },
      {
        $lookup : {
          from : "restaurants",
          localField : "restaurantId",
          foreignField : "_id",
          as : "restaurant",
          pipeline : [
            {
              $project : {
                name : 1,
                address : 1,
                phone : 1,
                isOpen : 1,
                rating : 1,
              }
            }
          ]
        }
      }
    ]);

    if(!orderDetails) {
      throw new ApiError(500, "Failed to fetch order details");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Order details fetched successfully", orderDetails));  
});

export { 
  initiateOrder,
  updateOrderByRestaurant,
  updateOrderByUser,
  completeOrder,
  cancelOrderByRestaurant,
  cancelOrderByUser,
  getUserOrders,
  getRestaurantOrders,
  getOrderDetails
};
