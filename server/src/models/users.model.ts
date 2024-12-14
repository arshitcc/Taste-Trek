import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY } from "../utils/env";
import { Request } from "express";

export interface CustomRequest extends Request {
  user: IUser;
}
export interface IAddress {
  _id?: string;
  street: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export enum UserType {
  USER = "user",
  ADMIN = "admin",
  RIDER = "rider",
}

export interface IUser extends Document {
  _id : mongoose.Types.ObjectId;
  fullname: string;
  email: string;
  username?: string;
  phone: string;
  role: UserType;
  password: string;
  restaurantId?:  mongoose.Types.ObjectId;
  avatar?: string;
  addresses?: IAddress[];
  isVerified : boolean;
  refreshToken?: string;
  validatePassword(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, default: "" },
    phone: { type: String, unique: true },
    role: { type: String, enum: UserType, default: UserType.USER },
    password: { type: String, required: true },
    avatar: { type: String },
    addresses: [
      {
        _id: { type: String },
        street: { type: String, required: true },
        pincode: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        location: { type: Object },
      },
    ],
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    isVerified : {type : Boolean, default : false},
    refreshToken: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.validatePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id },
    ACCESS_TOKEN_SECRET as string,
    { expiresIn: ACCESS_TOKEN_EXPIRY as string }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    REFRESH_TOKEN_SECRET as string,
    { expiresIn: REFRESH_TOKEN_EXPIRY as string }
  );
};

export const User = mongoose.model<IUser>("User", userSchema);
