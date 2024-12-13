import mongoose, { Document } from "mongoose";

export interface IFavourites extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
} 

const favouritesSchema = new mongoose.Schema<IFavourites>({
    userId : {type : mongoose.Schema.Types.ObjectId, ref : "User", required : true},
    orderId : {type : mongoose.Schema.Types.ObjectId, ref : "Order", required : true}
}, {timestamps : true});

export const Favourites = mongoose.model<IFavourites>("Favourites", favouritesSchema);