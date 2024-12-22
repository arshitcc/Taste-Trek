import { IRestaurant } from "./restaurant";

export interface ICart {
  _id: string;
  userId: string;
  restaurantId: string;
  restaurant: Partial<IRestaurant>;
  items: ICartItem[];
}

export interface ICartItem {
  foodId: string; 
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

export interface ICartState {
  isLoading: boolean;
  carts: ICart[];
  items: ICartItem[];
  addToCart: (restaurantId: string, cartItem: ICartItem) => Promise<void>;
  removeFromCart: (restaurantId: string, foodId: string) => Promise<void>;
  deleteCart: (restaurantId: string) => Promise<void>;
  getCartItems: (restaurantId: string) => Promise<void>;
  getCarts: () => Promise<void>;
}
