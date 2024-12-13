import mongoose, { Document } from "mongoose";
import { IAddress } from "./users.model";
import mongoosePaginate from "mongoose-paginate-v2";

export enum RestaurantStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended" 
}

export interface IRestaurant extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  address: IAddress;
  gst: string;
  image: string;
  cuisine: string[];
  email : string;
  phone: string;
  isOpen : boolean;
  rating : number;
  averageCostForTwo : number;
  isFeatured : boolean;
  status : RestaurantStatus;
}


const restaurantSchema = new mongoose.Schema<IRestaurant>(
  {
    name: { type: String, required: true, index: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gst : {type : String, required : true},
    image: { type: String, required: true },
    address: { type: Object, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    cuisine: { type: [String], required: true },
    isOpen : {type : Boolean, default : true},
    rating : {type : Number, default : 0},
    status : {type : String, enum : RestaurantStatus, default : RestaurantStatus.INACTIVE},
    averageCostForTwo : {type : Number, required : true},
    isFeatured : {type : Boolean, default : false},
    description : {type : String, required : true},
  },
  { timestamps: true }
);

restaurantSchema.plugin(mongoosePaginate);

export const Restaurant = mongoose.model<IRestaurant>("Restaurant",restaurantSchema) as mongoose.PaginateModel<IRestaurant>;
