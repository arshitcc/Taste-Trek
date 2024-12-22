import { UserLoginSchema, UserSignupSchema } from "@/schemas/user";

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

export interface IUser {
  _id: string;
  fullname: string;
  email: string;
  username : string;
  phone: string;
  addresses: IAddress[];
  avatar: string;
  restaurantId: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserState {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (userData: UserSignupSchema) => Promise<void>;
  login: (userData: UserLoginSchema) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (
    userData: Pick<IUser, "fullname" | "email" | "username" | "phone">
  ) => Promise<void>;
  updatePassword: (userData: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<void>;
  updateAvatar: (userData: FormData) => Promise<void>;
  addNewAddress: (userAddress: IAddress) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
}
