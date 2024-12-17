import mongoose, { Document } from "mongoose";
import { IAddress } from "./users.model";
import mongoosePaginate from "mongoose-paginate-v2";

export enum OrderStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  OUT_FOR_DELIVERY = "out for delivery",
  PREPARING = "preparing",
  CONFIRMED = "confirmed",
  READY_TO_DELIVER = "ready to deliver"
} 

export enum PaymentMethod {
  CASH = "cash",
  UPI = "upi",
  DCARD = "debit card",
  CCARD = "credit card"
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  REFUNDED = "refunded",
  FAILED = "failed"
}

export interface ICartItem {
  foodId : mongoose.Types.ObjectId;
  name : string;
  price : number;
  quantity : number;
  maxQuantity : number;
}

export interface IOrder extends Document {
  _id : mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  deliveryAddress: IAddress;
  orderPlacedAt: Date;
  estimatedDeliveryTime: Date;
  actualDeliveryTime: Date | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryPartnerId: mongoose.Types.ObjectId;
  deliveryRating: number;
  rating: number;
  preparationTime : number; 
  isGift : boolean; 
  specialInstructions : string;
  cancellationReason : string | null;
  review : string | null;
}

const orderSchema = new mongoose.Schema<IOrder>(
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
    items: {type : [{
      foodId : mongoose.Schema.Types.ObjectId,
      name : String,
      price : Number,
      quantity : Number,
      maxQuantity : Number
    }], required: true},    
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: Object, required: true },
    orderPlacedAt: { type: Date, required: true, default: Date.now() },
    estimatedDeliveryTime: { type: Date, required: true },
    actualDeliveryTime: { type: Date, default: null },
    status: { type: String,  enum: OrderStatus, default: OrderStatus.PENDING },
    paymentMethod: { type: String, enum: PaymentMethod, default: PaymentMethod.CASH },
    paymentStatus: { type: String, enum: PaymentStatus, default: PaymentStatus.PENDING },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default : null
    },
    deliveryRating: { type: Number, default: null },
    rating: { type: Number, default: null },
    preparationTime: { type: Number, required: true },
    isGift: { type: Boolean, default: false },
    specialInstructions: { type: String, default: null },
    cancellationReason: { type: String, default: null },
    review: { type: String, default: null },
  },
  { timestamps: true }
);

orderSchema.plugin(mongoosePaginate);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
