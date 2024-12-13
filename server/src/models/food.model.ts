import mongoose, { Document } from "mongoose";

export enum FoodCategory {
  STARTERS = "starters",
  MAIN_COURSE = "main course",
  SALADS = "salads",
  SNACKS = "snacks",
  DESSERTS = "desserts",
  BEVERAGES = "beverages"
}

export enum SpicyLevel {
  SWEET = "sweet",
  NEUTRAL = "neutral",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very high"
}

export interface IFood extends Document {
  name: string;
  description: string;
  category: FoodCategory;
  restaurantId: mongoose.Types.ObjectId;
  price: number;
  image: string;
  preparationTime: number;
  isAvailable : boolean;
  rating : number;
  reviewsCount : number;
  spicyLevel : SpicyLevel;
  tags : string[];
  maxQuantity : number;
}

const foodSchema = new mongoose.Schema<IFood>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    category: { type: String, enum: FoodCategory, required: true },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    preparationTime: { type: Number, required: true },
    isAvailable : {type : Boolean, default : true},
    rating : {type : Number, default : 0},
    reviewsCount : {type : Number, default : 0},
    spicyLevel : {type : String, default : SpicyLevel.LOW, enum : SpicyLevel},
    tags : {type : [String], default : [], required : true},
    maxQuantity : {type : Number, default : 10}
  },
  { timestamps: true }
);

export const FoodItem = mongoose.model<IFood>("FoodItem", foodSchema);
