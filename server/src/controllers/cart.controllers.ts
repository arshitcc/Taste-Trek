import { Cart } from "../models/cart.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Response } from "express";
import { isValidObjectId } from "mongoose";
import { FoodItem } from "../models/food.model";
import { CustomRequest } from "../models/users.model";
import { ICartItem } from "../models/orders.model";
import mongoose from "mongoose";

const addToCart = asyncHandler(async (req : CustomRequest, res : Response) => {
    const {restaurantId} = req.params;
    if(!isValidObjectId(restaurantId)){
        throw new ApiError(400, "Invalid Restaurant ID");
    }

    const {foodId, quantity} : ICartItem = req.body;
    if(!isValidObjectId(foodId)){
        throw new ApiError(400, "Invalid Food ID");
    }

    if(!quantity || quantity <= 0){
        throw new ApiError(400, "Invalid Quantity");
    }

    const food = await FoodItem.findById(foodId);
    if(!food){
        throw new ApiError(404, "Food item not found");
    }
    if(food.restaurantId.toString() !== restaurantId){
        throw new ApiError(400, "Food item does not belong to this restaurant");
    }

    const cartExists = await Cart.findOne({
        $and : [{userId : req.user._id}, {restaurantId : restaurantId}]
    });

    if(!cartExists){ 
        
        const cart = await Cart.create({
            userId : req.user._id,
            restaurantId : restaurantId,
            items : [{
                foodId,
                name : food.name,
                price : food.price,
                quantity,
                maxQuantity : food.maxQuantity
            }]
        });

        if(!cart){
            throw new ApiError(500, "Failed to create cart");
        }

        return res.status(201)
        .json(new ApiResponse(201, "Food item added to cart successfully", { cart }));
    }
    else{
        const itemExists = cartExists.items.some((item) => item.foodId.toString() === foodId.toString());

        if(!itemExists){
            cartExists.items.push({foodId, name : food.name, price : food.price, quantity, maxQuantity : food.maxQuantity});
        }
        else{
            cartExists.items = cartExists.items.map((item) => item.foodId.toString() === foodId.toString() ? {...item, quantity} : item);
        }
        
        const updatedCart = await cartExists.save({validateBeforeSave : false});
        if(!updatedCart){
            throw new ApiError(500, "Failed to update cart try again.");
        }

        return res.status(200)
        .json(new ApiResponse(200, "Cart updated successfully", {cart : updatedCart}));
    }
});

const removeFromCart = asyncHandler(async (req : CustomRequest, res : Response) => {
    const {restaurantId} = req.params;
    const {foodId} = req.body;
    
    if(!isValidObjectId(restaurantId) || !isValidObjectId(foodId)){
        throw new ApiError(400, "Invalid Restaurant ID or Food ID");
    }

    const cartExists = await Cart.findOne({
        $and : [{userId : req.user._id}, {restaurantId}]
    });

    if(!cartExists){
        throw new ApiError(404, "Cart not found");
    }  

    const updatedCart = await Cart.findByIdAndUpdate(cartExists._id, 
        {
            $pull : {
                items : {foodId}
            }
        },
        {
            new : true
        }
    );

    if(!updatedCart){
        throw new ApiError(500, "Failed to update the cart");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Food item removed from cart successfully", { cart : updatedCart}));
});

const deleteCart = asyncHandler(async(req : CustomRequest, res : Response) => {
    const {restaurantId} = req.params;
    if(!isValidObjectId(restaurantId)){
        throw new ApiError(400, "Invalid Restaurant ID");
    }

    const cartExists = await Cart.findOne({
        $and : [{userId : req.user._id}, {restaurantId}]
    });

    if(!cartExists){
        throw new ApiError(404, "Cart not found");
    }

    const deletedCart = await Cart.findByIdAndDelete(cartExists._id);    
    
    if(!deletedCart){
        throw new ApiError(500, "Failed to delete the cart");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Cart deleted successfully", {}));
})

const getCartItems = asyncHandler(async (req : CustomRequest, res : Response) => {
    
    const {restaurantId} = req.params;
    if(!isValidObjectId(restaurantId)){
        throw new ApiError(400, "Invalid Restaurant ID");
    }
    
    const cart = await Cart.aggregate([
        {
            $match : {
                userId : new mongoose.Types.ObjectId(req.user._id),
                restaurantId : new mongoose.Types.ObjectId(restaurantId)
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

                        }
                    }
                ]
            }
        },
        {
            $unwind :  "$restaurant"
        },
        {
            $project : {
                items : 1,
                restaurant : 1
            }
        }
    ]);

    if(!cart){
        throw new ApiError(404, "Cart not found");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Cart items fetched successfully", {cart}));
});

const getCarts = asyncHandler(async (req : CustomRequest, res : Response) => {

    const carts = await Cart.aggregate([
        {
            $match : {
                userId : new mongoose.Types.ObjectId(req.user._id)
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
                            address : 1
                        }
                    }
                ]
            }
        },
        {
            $unwind :  "$restaurant"
        },
        {
            $project : {
                _id : 1,
                restaurant : 1,
                items : 1
            }
        }
    ]);

    if(!carts){
        throw new ApiError(500, "Failed to find your carts !! Try Again after sometime !!");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Cart items fetched successfully", carts));
})

export {addToCart, removeFromCart, getCartItems, getCarts, deleteCart};