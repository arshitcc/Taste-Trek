import { IFood } from "./food";
import { IAddress } from "./user";

export enum RestaurantStatus {
  ACTIVE = "active", 
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface IRestaurant {
  _id?: string;
  owner?: string;
  name: string;
  description: string;
  address: IAddress;
  image?: string;
  cuisine: string[];
  email: string;
  gst: string;
  phone: string;
  averageCostForTwo: number;
  isFeatured?: boolean;
  status?: RestaurantStatus;
  foodItems? : IFood[];
  deliveryTime? : number;
  rating? : number;
}

export interface IAppliedFilters {
  avgCost?: number|null;
  rating?: number|null;
  isFeatured?: boolean;
  cuisines?: string[];
}

export interface IRestaurantState {
  adminRestaurant: IRestaurant | null;
  isLoading: boolean;
  searchedRestaurants: IRestaurant[];
  restaurant: IRestaurant | null;
  appliedFilters: IAppliedFilters;
  applicableFilters : IAppliedFilters;

  createRestaurant: (restaurantData: FormData) => Promise<void>;
  updateRestaurant: (restaurantData: IRestaurant, restaurantId : string) => Promise<void>;
  getAdminRestaurant: (restaurantId: string) => Promise<void>;
  getRestaurantByID: (restaurantId: string) => Promise<void>;
  deleteRestaurant: (restaurantId: string) => Promise<void>;
  toggleRestaurantStatus: (restaurantId: string) => Promise<void>;
  getRestaurantByName: (name: string) => Promise<void>;
  getFetauredRestaurants: (city: string) => Promise<void>;
  getRestaurantByCuisine: (cuisine: string) => Promise<void>;
  getRestaurantByLocation: (city: string) => Promise<void>;
  getQueryRestaurants: (searchText: string, appliedFilters: any) => Promise<void>;
  updateOrderByRestaurant: (
    orderId: string,
    restaurantId: string,
    status : string
  ) => Promise<void>;
  setAppliedFilters: (appliedFilters : IAppliedFilters) => void;
  resetAppliedFilters: () => void;
}