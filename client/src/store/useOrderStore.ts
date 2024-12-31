import axios from "axios";
import { toast } from "sonner";
import { create, StateCreator } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { IOrderState, IOrder, OrderStatus } from "@/types/order";

const API_END_POINT = `${import.meta.env.VITE_API_URL}/api/v1/orders`;
axios.defaults.withCredentials = true;

const orderStore: StateCreator<IOrderState> = (set) => ({
  isLoading: false,
  order: {} as IOrder,
  userOrders: [] as IOrder[],
  adminOrders: [] as IOrder[],

  initiateOrder: async (orderData: IOrder) => {
    try {
      set({ isLoading: true });
      const { data } = await axios.post(
        `${API_END_POINT}/${orderData.restaurantId}/initiate`,
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        set({
          isLoading: false,
          order: data.data,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  getUserOrders: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get(`${API_END_POINT}/`);

      if (data.success) {
        set({
          isLoading: false,
          userOrders: data.data,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  getRestaurantOrders: async (restaurantId: string) => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get(
        `${API_END_POINT}/restaurant/${restaurantId}`
      );
      if (data.success) {
        set({
          isLoading: false,
          adminOrders: data.data,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.data.message);
      set({ isLoading: false });
    }
  },
  getOrderDetails: async (orderId: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_END_POINT}/${orderId}`);
      if (response.data.success) {
        set({
          isLoading: false,
          order: response.data.order,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  updateOrderByUser: async (orderId: string, specialInstructions: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(`${API_END_POINT}/${orderId}`, {
        specialInstructions,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          order: response.data.order,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  updateOrderByRestaurant: async (
    restaurantId: string,
    orderId: string,
    status: OrderStatus
  ) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(
        `${API_END_POINT}/${restaurantId}/update/${orderId}`,
        { status }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          order: response.data.order,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  cancelOrderByUser: async (orderId: string, cancellationReason: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(`${API_END_POINT}/${orderId}/cancel`, {
        cancellationReason,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          order: response.data.data,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  cancelOrderByRestaurant: async (
    restaurantId: string,
    orderId: string,
    cancellationReason: string
  ) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(
        `${API_END_POINT}/${restaurantId}/cancel/${orderId}`,
        { cancellationReason }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          order: response.data.order,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  completeOrder: async (
    orderId: string,
    orderData: Pick<IOrder, "deliveryRating" | "actualDeliveryTime">
  ) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(
        `${API_END_POINT}/${orderId}/complete`,
        orderData
      );
      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          order: response.data.order,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
});

export const useOrderStore = create<IOrderState>()(
  devtools(
    persist<IOrderState>(orderStore, {
      name: "order-store",
      storage: createJSONStorage(() => localStorage),
    }),
    {
      name: "Order-Store",
    }
  )
);
