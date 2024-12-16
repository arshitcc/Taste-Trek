import {
    Restaurant,
    IRestaurant,
    RestaurantStatus,
  } from "../models/restaurants.model";
  import { IAddress, User } from "../models/users.model";
  import { FoodItem } from "../models/food.model";
  import { Order, OrderStatus } from "../models/orders.model";
  import { deleteFile } from "../utils/cloudinary";
  import { CustomRequest } from "../models/users.model";
  import { Response } from "express";
  import { asyncHandler } from "../utils/asyncHandler";
  import { ApiError } from "../utils/apiError";
  import { ApiResponse } from "../utils/apiResponse";
  import mongoose, { isValidObjectId } from "mongoose";
  import { uploadFile } from "../utils/cloudinary";
  
  interface IAppliedFilters {
    page?: number;
    limit?: number;
    avgCost?: number;
    rating?: number;
    isFeatured?: boolean;
    cuisines?: string;
    city?: string;
  }
  const createRestaurant = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const existingRestaurant = await Restaurant.findOne({
        owner: req.user._id,
      });
  
      if (existingRestaurant) {
        throw new ApiError(402, "You already have a restaurant");
      }
  
      const {
        name,
        description,
        address,
        cuisine,
        phone,
        email,
        gst,
      }: IRestaurant = req.body;
      const { street, pincode, city, state, country, location }: IAddress =
        address;
  
      const { latitude, longitude } = location || {
        latitude: "0",
        longitude: "0",
      };
  
      const { averageCostForTwo } = req.body;
      let avgCost = Math.floor(averageCostForTwo);
  
      if (
        [
          name,
          description,
          street,
          city,
          state,
          country,
          pincode,
          phone,
          gst,
        ].some((field) => !field?.trim()) ||
        !cuisine ||
        cuisine.length === 0 ||
        !latitude ||
        !longitude ||
        !avgCost ||
        avgCost <= 0
      ) {
        throw new ApiError(400, "All fields are required");
      }
  
      const img = req.file?.path;
      if (!img?.trim()) {
        throw new ApiError(400, "Image is required");
      }
  
      const image = (await uploadFile(img)) || "";
  
      const restaurant = await Restaurant.create({
        owner: req.user._id,
        name,
        description,
        address,
        cuisine,
        phone,
        email,
        gst,
        image,
        averageCostForTwo: avgCost,
      });
  
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          restaurantId: restaurant._id,
        },
      });
  
      if (!restaurant) throw new ApiError(500, "Failed to create restaurant");
  
      return res
        .status(201)
        .json(
          new ApiResponse(201, "Restaurant created successfully", restaurant)
        );
    }
  );
  
  const updateRestaurant = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const {
        name,
        description,
        address,
        cuisine,
        phone,
        email,
        gst,
        isOpen,
      }: IRestaurant = req.body;
      const { street, pincode, city, state, country, location }: IAddress =
        address;
      const { latitude, longitude } = location || {
        latitude: "0",
        longitude: "0",
      };
      const { restaurantId } = req.params;
  
      if (!isValidObjectId(restaurantId))
        throw new ApiError(400, "Invalid restaurant id");
  
      const { averageCostForTwo } = req.body;
      let avgCost = Math.floor(averageCostForTwo);
  
      if (
        [
          name,
          description,
          street,
          city,
          state,
          country,
          pincode,
          phone,
          email,
          gst,
        ].some((field) => !field || field?.trim() === "") ||
        !cuisine ||
        cuisine.length === 0 ||
        !latitude ||
        !longitude ||
        !avgCost ||
        avgCost <= 0
      )
        throw new ApiError(400, "All fields are required");
  
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) throw new ApiError(404, "Restaurant not found");
  
      if (restaurant.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
          403,
          "You are not authorized to update this restaurant"
        );
      }
  
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        restaurantId,
        {
          $set: {
            name,
            description,
            address,
            cuisine,
            phone,
            email,
            gst,
            isOpen,
            averageCostForTwo: avgCost,
          },
        },
        { new: true }
      );
  
      if (!updatedRestaurant)
        throw new ApiError(500, "Failed to update restaurant");
  
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Restaurant updated successfully",
            updatedRestaurant
          )
        );
    }
  );
  
  const getAdminRestaurant = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const { restaurantId } = req.params;
  
      if (!isValidObjectId(restaurantId))
        throw new ApiError(400, "Invalid restaurant id");
  
  
      const restaurant = await Restaurant.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(restaurantId),
          },
        },
        {
          $lookup: {
            from: "fooditems",
            localField: "_id",
            foreignField: "restaurantId",
            as: "foodItems",
            pipeline: [
              {
                $match: {
                  isAvailable: true,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  phone: 1,
                  email: 1,
                },
              },
            ],
          },
        },
      ]);
  
      if (!restaurant) throw new ApiError(404, "Restaurant not found");
  
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Admin Restaurant fetched successfully",
            restaurant[0]
          )
        );
    }
  );
  
  const deleteRestaurant = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const { restaurantId } = req.params;
  
      if (!isValidObjectId(restaurantId))
        throw new ApiError(400, "Invalid restaurant id");
  
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) throw new ApiError(404, "Restaurant not found");
  
      if (restaurant.owner.toString() !== req.user._id.toString())
        throw new ApiError(
          403,
          "You are not authorized to delete this restaurant"
        );
  
      const foodItems = await FoodItem.find({ restaurant: restaurantId });
      foodItems.forEach(async (food) => {
        if (food.image) await deleteFile(food.image);
        await FoodItem.findByIdAndDelete(food._id);
      });
  
      await Restaurant.findByIdAndDelete(restaurantId);
  
      return res
        .status(200)
        .json(new ApiResponse(200, "Restaurant deleted successfully", {}));
    }
  );
  
  const getQueryRestaurants = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const {
        page = 1,
        limit = 10,
        avgCost,
        rating,
        isFeatured,
        cuisines,
      }: IAppliedFilters = req.query;
      const { searchText } = req.params;
  
      const pipeline = [];
  
      if (searchText || avgCost || rating || isFeatured || cuisines) {
        const orConditions = [];
  
        if (searchText) {
          orConditions.push(
            { name: { $regex: searchText, $options: "i" } },
            { "address.city": { $regex: searchText, $options: "i" } },
            { cuisine: { $regex: searchText, $options: "i" } },
            { "address.city": req.user.addresses?.[0]?.city || "" }
          );
        }
  
        if (avgCost) {
          orConditions.push({
            averageCostForTwo: Number(avgCost),
          });
        }
  
        if (rating) {
          orConditions.push({
            rating: {
              $gte: Number(rating),
            },
          });
        }
  
        if (cuisines) {
          const restaurantCuisines = cuisines.split(",");
          orConditions.push({
            cuisine: {
              $in: restaurantCuisines,
            },
          });
        }
  
        if (isFeatured) {
          orConditions.push({
            isFeatured: isFeatured,
          });
        }
  
        pipeline.push({
          $match: {
            $or: orConditions,
          },
        });
      }
  
      pipeline.push({
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          address: 1,
          cuisine: 1,
          phone: 1,
          rating: 1,
          isOpen: 1,
          isFeatured: 1,
          averageCostForTwo: 1,
        },
      });
  
      const skip = (Number(page) - 1) * Number(limit);
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: Number(limit) });
  
      const restaurants = await Restaurant.aggregate(pipeline);
  
      const totalCountPipeline = [...pipeline.slice(0, -2), { $count: "total" }];
      const totalCountResult = await Restaurant.aggregate(totalCountPipeline);
      const total = totalCountResult[0]?.total || 0;
  
      if (!restaurants) {
        throw new ApiError(500, "Failed to fetch restaurants");
      }
  
      return res.status(200).json(
        new ApiResponse(201, "Restaurants fetched successfully", {
          restaurants,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
          },
        })
      );
    }
  );
  
  const getRestaurantsByCuisine = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const { cuisine } = req.params;
  
      const restaurants = await Restaurant.aggregate([
        {
          $match: {
            cuisine: { $in: [cuisine] },
            // cuisine : cuisine, // (alternate)
          },
        },
      ]);
  
      if (!restaurants) throw new ApiError(500, "Failed to fetch restaurants");
  
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Restaurants fetched successfully", restaurants)
        );
    }
  );
  
  const getRestaurantsByLocation = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const { city } = req.params;
  
      const restaurants = await Restaurant.aggregate([
        {
          $match: {
            "address.city": city,
          },
        },
      ]);
  
      if (!restaurants) throw new ApiError(500, "Failed to fetch restaurants");
  
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Restaurants fetched successfully", restaurants)
        );
    }
  );
  
  const toggleRestaurantStatus = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const { restaurantId } = req.params;
  
      if (!isValidObjectId(restaurantId))
        throw new ApiError(400, "Invalid restaurant id");
  
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) throw new ApiError(404, "Restaurant not found");
  
      if (restaurant.owner.toString() !== req.user._id.toString())
        throw new ApiError(
          403,
          "You are not authorized to toggle this restaurant status"
        );
  
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        restaurantId,
        {
          $set: {
            isOpen: !restaurant.isOpen,
          },
        },
        { new: true }
      );
  
      if (!updatedRestaurant)
        throw new ApiError(500, "Failed to toggle restaurant status");
  
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Restaurant status toggled successfully",
            updatedRestaurant
          )
        );
    }
  );
  
  const getFeaturedRestaurants = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const { city } = req.params;
  
      const restaurants = await Restaurant.aggregate([
        {
          $match: {
            isFeatured: true,
            "address.city": city,
          },
        },
      ]);
  
      if (!restaurants)
        throw new ApiError(500, "Failed to fetch featured restaurants");
  
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Featured restaurants fetched successfully",
            restaurants
          )
        );
    }
  );
  
  const getRestaurantByID = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const { restaurantId } = req.params;
  
      if (!isValidObjectId(restaurantId))
        throw new ApiError(400, "Invalid restaurant id");
  
      const restaurant = await Restaurant.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(restaurantId),
          },
        },
        {
          $lookup: {
            from: "fooditems",
            localField: "_id",
            foreignField: "restaurantId",
            as: "foodItems",
            pipeline: [
              {
                $match: {
                  isAvailable: true,
                },
              },
              {
                $project: {
                  isAvailable: 0,
                },
              },
            ],
          },
        },
        {
          $project: {
            gst: 0,
            owner: 0,
          },
        },
      ]);
  
      if (!restaurant) throw new ApiError(500, "Failed to fetch restaurant");
  
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Restaurant fetched successfully", restaurant[0])
        );
    }
  );
  
  const getNearbyRestaurants = asyncHandler(async(req : CustomRequest, res : Response) => {
  
    const { latitude, longitude } = req.body;
    
  
  
  })
  
  const updateOrderStatus = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const { orderId, restaurantId } = req.params;
      const { status } = req.body;
  
      if (!isValidObjectId(orderId) || !isValidObjectId(restaurantId))
        throw new ApiError(400, "Invalid order id or restaurant id");
  
      const order = await Order.findById(orderId);
      if (!order) throw new ApiError(404, "Order not found");
  
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) throw new ApiError(404, "Restaurant not found");
  
      if (order.restaurantId.toString() !== restaurantId) {
        throw new ApiError(403, "You are not authorized to update this order");
      }
  
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: { status },
        },
        { new: true }
      );
  
      if (!updatedOrder) throw new ApiError(500, "Failed to update order status");
  
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Order status updated successfully", updatedOrder)
        );
    }
  );
  
  export {
    createRestaurant,
    updateRestaurant,
    getAdminRestaurant,
    deleteRestaurant,
    getRestaurantsByCuisine,
    getRestaurantsByLocation,
    toggleRestaurantStatus,
    getQueryRestaurants,
    getFeaturedRestaurants,
    getRestaurantByID,
    updateOrderStatus,
  };
  