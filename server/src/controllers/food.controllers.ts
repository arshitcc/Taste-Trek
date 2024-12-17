import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { FoodItem, IFood } from "../models/food.model";
import { CustomRequest } from "../models/users.model";
import mongoose, { isValidObjectId } from "mongoose";
import { uploadFile, deleteFile } from "../utils/cloudinary";
import { FoodCategory, SpicyLevel } from "../models/food.model";


const addFoodItem = asyncHandler(async (req : CustomRequest, res : Response) => {

    const {restaurantId} = req.params;
    if(!isValidObjectId(restaurantId)) {
        throw new ApiError(400, "Invalid restaurant ID");
    }
    
    const {name, description, category, spicyLevel, tags} : IFood = req.body;

    if(!Object.values(FoodCategory).includes(category)) {
        throw new ApiError(400, "Invalid category");
    }
    if(!Object.values(SpicyLevel).includes(spicyLevel)) {
        throw new ApiError(400, "Invalid spicy level");
    }

    let {price, preparationTime, maxQuantity} = req.body;
    price = Math.floor(price);
    preparationTime = Math.floor(preparationTime);
    maxQuantity = Math.floor(maxQuantity);

    if(
        [name, description, category, spicyLevel].some((field) => (!field?.trim())) || 
        [price, preparationTime, maxQuantity].some((field) => (!field || field<=0)) ||
        (spicyLevel === undefined) ||
        tags.length === 0
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const img = req.file?.path;
    if(!img?.trim()){
        throw new ApiError(400, "Image is required");
    }

    const image = await uploadFile(img) || "";

    const food = await FoodItem.create({
        name, 
        description, 
        category, 
        price, 
        preparationTime, 
        image, 
        restaurantId,
        spicyLevel, 
        tags, 
        maxQuantity,
    });

    if(!food) {
        throw new ApiError(500, "Failed to add food item! Try after some time");
    }

    return res.status(200).json(new ApiResponse(200, "Food item added successfully", food));
});

const removeFoodItem = asyncHandler(async (req : CustomRequest, res : Response) => {
    const {foodId, restaurantId} = req.params;
    if(!isValidObjectId(foodId) || !isValidObjectId(restaurantId)) {
        throw new ApiError(400, "Invalid food item ID or restaurant ID");
    }

    const food = await FoodItem.findById(foodId);
    if(!food) {
        throw new ApiError(404, "Food item not found");
    }

    if(food.restaurantId.toString() !== restaurantId.toString()) {
        throw new ApiError(403, "You are not authorized to remove this food item");
    }
    
    if(food.image) await deleteFile(food.image);
    await FoodItem.findByIdAndDelete(foodId);
    return res.status(200).json(new ApiResponse(200, "Food item removed successfully",{}));
});

const updateFoodItemDetails = asyncHandler(async (req : CustomRequest, res : Response) => {
    const {restaurantId} = req.params;
    const {foodId} = req.params;

    if(!isValidObjectId(foodId) || !isValidObjectId(restaurantId)) {
        throw new ApiError(400, "Invalid food item ID or restaurant ID");
    }

    const food = await FoodItem.findById(foodId);
    if(!food) {
        throw new ApiError(404, "Food item not found");
    }

    if(food.restaurantId.toString() !== restaurantId.toString()) {
        throw new ApiError(403, "You are not authorized to update this food item");
    }

    const {name, description, category,  spicyLevel, tags} : IFood = req.body;
    let {price, preparationTime, maxQuantity} = req.body;
    price = Math.floor(price);  
    preparationTime = Math.floor(preparationTime);
    maxQuantity = Math.floor(maxQuantity);
    
    if(
        [name, description, category, spicyLevel].some((field) => (!field?.trim())) || 
        [price, preparationTime, maxQuantity].some((field) => (!field || field<=0)) ||
        (spicyLevel === undefined) ||
        tags.length === 0
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if(!Object.values(FoodCategory).includes(category)) {
        throw new ApiError(400, "Invalid category");
    }
    if(!Object.values(SpicyLevel).includes(spicyLevel)) {
        throw new ApiError(400, "Invalid spicy level");
    }

    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
        foodId,
        {
            $set : {
                name,
                description,
                category,
                price,
                preparationTime,
                spicyLevel,
                tags,
                maxQuantity,
            }
        },
        {new : true}
    );
    
    if(!updatedFoodItem) {
        throw new ApiError(404, "Food item not found");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Food item details updated successfully", updatedFoodItem));
});

const updateFoodImage = asyncHandler(async (req : CustomRequest, res : Response) => {

    const {foodId, restaurantId} = req.params;    
    if(!isValidObjectId(foodId) || !isValidObjectId(restaurantId)) {
        throw new ApiError(400, "Invalid food item ID or restaurant ID");
    }

    const food = await FoodItem.findById(foodId);
    if(!food) {
        throw new ApiError(404, "Food item not found");
    }

    if(food.restaurantId.toString() !== restaurantId.toString()) {
        throw new ApiError(403, "You are not authorized to update this food item");
    }

    const prevImg = food.image;

    const img = req.file?.path;
    if(!img) {
        throw new ApiError(400, "Image is required");
    }
    const image = await uploadFile(img);
   
    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
        foodId,
        {
            $set : {
                image 
            }
        },
        {new : true}
    );

    if(!updatedFoodItem) {
        throw new ApiError(404, "Food item not found");
    }

    if(prevImg) await deleteFile(prevImg);

    return res.status(200)
    .json(new ApiResponse(200, "Food item image updated successfully", updatedFoodItem));
});

const toggleFoodAvailability = asyncHandler(async (req : CustomRequest, res : Response) => {
    const {foodId, restaurantId} = req.params;
    if(!isValidObjectId(foodId) || !isValidObjectId(restaurantId)) {
        throw new ApiError(400, "Invalid food item ID or restaurant ID");
    }

    const food = await FoodItem.findById(foodId);
    if(!food) {
        throw new ApiError(404, "Food item not found");
    }

    if(food.restaurantId.toString() !== restaurantId.toString()) {
        throw new ApiError(403, "You are not authorized to toggle availability of this food item");
    }

    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
        foodId,
        {
            $set : {
                isAvailable : !food.isAvailable
            }
        },
        {new : true}
    );

    if(!updatedFoodItem) {
        throw new ApiError(404, "Food item not found");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Food item availability toggled successfully", updatedFoodItem));
});

const getRestaurantMenu = asyncHandler(async (req : CustomRequest, res : Response) => {
    const {restaurantId} = req.params;
    if(!isValidObjectId(restaurantId)) {
        throw new ApiError(400, "Invalid restaurant ID");
    }

    const items = await FoodItem.aggregate([
        {
            $match: {
                restaurantId : new mongoose.Types.ObjectId(restaurantId),
            }
        },  
    ]);

    if(!items) {
        throw new ApiError(500, "Failed to fetch menu items");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Menu items fetched successfully", items));
})


export {    
    addFoodItem,
    removeFoodItem,
    getRestaurantMenu,
    updateFoodItemDetails,
    updateFoodImage,
    toggleFoodAvailability
}
