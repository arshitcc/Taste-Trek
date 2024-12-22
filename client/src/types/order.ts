import { IAddress } from "./user";
import { ICartItem } from "./cart";
import { IRestaurant } from "./restaurant";

export enum OrderStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  OUT_FOR_DELIVERY = "out for delivery",
  PREPARING = "preparing",
  CONFIRMED = "confirmed",
  READY_TO_DELIVER = "ready to deliver",
}

export enum OrderStatusColor {
  PENDING = "yellow",
  DELIVERED = "green",
  CANCELLED = "red",
  OUT_FOR_DELIVERY = "purple",
  PREPARING = "blue",
  CONFIRMED = "teal",
  READY_TO_DELIVER = "pink"
}

export enum OrderStatusIcons {
  PENDING = "CircleEllipsis",
  PREPARING = "CookingPot",
  OUT_FOR_DELIVERY = "Bike",
  DELIVERED = "Handshake",
  CONFIRMED = "BookmarkCheck",
  READY_TO_DELIVER = "PackageCheck",
  CANCELLED = "TicketX"
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
  FAILED = "failed",
}

export interface IOrder {
  _id? : string;
  userId?: string;
  restaurantId: string;
  restaurant ?: IRestaurant;
  items: ICartItem[];
  totalAmount: number;
  deliveryAddress: IAddress;
  orderPlacedAt?: Date;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date | null;
  status?: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryPartnerID?: string;
  deliveryRating?: number;
  rating?: number;
  preparationTime: number;
  isGift?: boolean;
  specialInstructions?: string;
  cancellationReason?: string | null;
  review?: string | null;
}

export interface IOrderState {
  isLoading: boolean;
  order: IOrder;
  adminOrders: IOrder[];
  userOrders: IOrder[];

  initiateOrder: (orderData: IOrder) => Promise<void>;
  getUserOrders: () => Promise<void>;
  getRestaurantOrders: (restaurantId: string) => Promise<void>;
  getOrderDetails: (orderId: string) => Promise<void>;
  updateOrderByUser: (
    orderId: string,
    specialInstructions: string
  ) => Promise<void>;
  updateOrderByRestaurant: (
    restaurantId: string,
    orderId: string,
    status: OrderStatus
  ) => Promise<void>;
  cancelOrderByUser: (
    orderId: string,
    cancellationReason: string
  ) => Promise<void>;
  cancelOrderByRestaurant: (
    restaurantId: string,
    orderId: string,
    cancellationReason: string
  ) => Promise<void>;
  completeOrder: (
    orderId: string,
    orderData: Pick<IOrder, "deliveryRating" | "actualDeliveryTime">
  ) => Promise<void>;
}
