import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { isValidObjectId } from "mongoose";
import { CustomRequest } from "../models/users.model";
import { Order } from "../models/orders.model";
import { Favourites } from "../models/favourites.model";
import { OrderStatus } from "../models/orders.model";

const addToFavourites = asyncHandler(async (req : CustomRequest, res : Response) => {
    const {orderId} = req.params;

    if(!isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid order ID");
    }

    const order = await Order.findById(orderId);
    if(!order) {
        throw new ApiError(404, "Order not found");
    }

    if(order.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to add this order to favourites");
    }

    if(order.status !== OrderStatus.DELIVERED) {
        throw new ApiError(400, "Order must be delivered to add to favourites");
    }

    if(await Favourites.findOne({userId : req.user._id, orderId})) {
        throw new ApiError(400, "Order already in favourites");
    }

    const favourites = await Favourites.create({userId : req.user._id, orderId});

    return res.status(200)
    .json(new ApiResponse(200, "Order added to favourites successfully", favourites));
});

const removeFromFavourites = asyncHandler(async (req : CustomRequest, res : Response) => {
    const {orderId} = req.params;

    if(!isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid order ID");
    }   

    const order = await Order.findById(orderId);
    if(!order) {
        throw new ApiError(404, "Order not found");
    }

    if(order.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to remove this order from favourites");
    }

    const favourites = await Favourites.findOneAndDelete({userId : req.user._id, orderId});
    if(!favourites) {
        throw new ApiError(404, "Order not found in favourites");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Order removed from favourites successfully", favourites));
}); 

const getFavourites = asyncHandler(async (req : CustomRequest, res : Response) => {

    const favourites = await Favourites.aggregate([
        {
            $match : {
                userId : req.user._id
            }
        },
        {
            $sort : {
                createdAt : -1
            }
        },
        {
            $lookup : {
                from : "orders",
                localField : "orderId",
                foreignField : "_id",
                as : "orderDetails",
                pipeline : [
                    {
                        $lookup : {
                            from : "restaurants",
                            localField : "restaurantId",
                            foreignField : "_id",
                            as : "restaurantDetails",
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
                        $unwind : "$restaurantDetails"
                    },
                    {
                        $project : {
                            _id : 1,
                            orderPlacedAt : 1,
                            status : 1,
                            totalAmount : 1,
                            restaurantDetails : 1
                        }
                    }
                ]
            }
        },
        {
            $unwind : "$orderDetails"
        },
        {
            $project : {
                _id : 1,
                orderDetails : 1,
                restaurantDetails : 1
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, "Favourites fetched successfully", favourites));
});

export {
    addToFavourites,
    removeFromFavourites,
    getFavourites
}