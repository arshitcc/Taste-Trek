import mongoose, { Document } from "mongoose";
import { ICartItem } from "./orders.model";

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  items: ICartItem[];
}

const cartSchema = new mongoose.Schema<ICart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items : {type : [{
      foodId : mongoose.Schema.Types.ObjectId,
      name : String,
      price : Number,
      quantity : Number,
      maxQuantity : Number
    }], required : true}
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>("Cart", cartSchema);
