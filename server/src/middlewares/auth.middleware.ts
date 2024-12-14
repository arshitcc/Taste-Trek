import { NextFunction, Request, RequestHandler } from "express";
import { ApiError } from "../utils/apiError";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/users.model";
import { CustomRequest } from "../models/users.model";
import { isValidObjectId } from "mongoose";
import { Restaurant } from "../models/restaurants.model";
import { ACCESS_TOKEN_SECRET } from "../utils/env";
import { asyncHandler } from "../utils/asyncHandler";

const verifyJWT : RequestHandler = asyncHandler(async (req : Request, _ : any, next : NextFunction) => {
    
    const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
    
    if(!token) {
        throw new ApiError(401, "Unauthorized");
    }
    
    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET as string) as {_id : string};
    
    if(!decodedToken) {
        throw new ApiError(401, "Unauthorized Token");
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if(!user) {
        throw new ApiError(401, "Unauthorized User");
    }
    
    (req as CustomRequest).user = user as IUser;
    next();
});

const verifyRestaurantOwner : RequestHandler = asyncHandler(async (req : Request, _ : any, next : NextFunction) => {     
    const {restaurantId} = req.params;    
           
    if(!isValidObjectId(restaurantId)){
        throw new ApiError(400, "Invalid restaurant ID");
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    if(!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }
    
    if(restaurant.owner.toString() !== ((req as CustomRequest).user._id.toString())) {
        throw new ApiError(403, "Unauthorized to access this resource");   
    }
    next();
});  

export {verifyJWT, verifyRestaurantOwner}; 