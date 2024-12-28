import { create, StateCreator } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import { toast } from "sonner";
import {
  IAppliedFilters,
  IRestaurant,
  IRestaurantState,
} from "@/types/restaurant";

const API_END_POINT = `${import.meta.env.VITE_API_URL}/api/v1/restaurants`;
axios.defaults.withCredentials = true;

const restaurantStore: StateCreator<IRestaurantState> = (set) => ({
  adminRestaurant: {} as IRestaurant,
  isLoading: true,
  searchedRestaurants: [],
  appliedFilters: {} as IAppliedFilters,
  applicableFilters: {
    avgCost: 2,
    rating: 2,
    isFeatured: true,
    cuisines: ["Indian", "Burger", "Chinese"],
  },
  restaurant: {} as IRestaurant,

  createRestaurant: async (restaurantData: FormData) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(
        `${API_END_POINT}/admin`,
        restaurantData,
        {
          headers: {
            "Contetnt-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          adminRestaurant: response.data.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  updateRestaurant: async (
    restaurantData: IRestaurant,
    restaurantId: string
  ) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(
        `${API_END_POINT}/admin/${restaurantId}`,
        restaurantData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          adminRestaurant: response.data.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  getAdminRestaurant: async (restaurantId: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(
        `${API_END_POINT}/admin/${restaurantId}`
      );

      if (response.data.success) {
        set({
          isLoading: false,
          adminRestaurant: response.data.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  getRestaurantByID: async (restaurantId: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_END_POINT}/${restaurantId}`);

      if (response.data.success) {
        set({
          isLoading: false,
          restaurant: response.data.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  deleteRestaurant: async (restaurantId: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.delete(`${API_END_POINT}/${restaurantId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          adminRestaurant: null,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  toggleRestaurantStatus: async (restaurantId: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(
        `${API_END_POINT}/${restaurantId}/toggle-status`
      );
      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          adminRestaurant: response.data.restaurant,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  getQueryRestaurants: async (
    searchText: string,
    appliedFilters: IAppliedFilters
  ) => {
    const params = new URLSearchParams();

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.append(key, value.join(","));
      } else {
        params.append(key, value);
      }
    });
    const url = `${API_END_POINT}/search/${searchText}?${params.toString()}`;

    try {
      set({ isLoading: true });
      const response = await axios.get(url);

      if (response.data.success) {
        set({
          isLoading: false,
          searchedRestaurants: response.data.data.restaurants,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  getRestaurantByName: async (name: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_END_POINT}/search/${name}`);
      if (response.data.success) {
        set({
          isLoading: false,
          searchedRestaurants: response.data.restaurants,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  getFetauredRestaurants: async (city: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_END_POINT}/featured/${city}`);
      if (response.data.success) {
        set({
          isLoading: false,
          searchedRestaurants: response.data.restaurants,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  getRestaurantByCuisine: async (cuisine: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_END_POINT}/cuisine/${cuisine}`);
      if (response.data.success) {
        set({
          isLoading: false,
          searchedRestaurants: response.data.restaurants,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  getRestaurantByLocation: async (city: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_END_POINT}/location/${city}`);
      if (response.data.success) {
        set({
          isLoading: false,
          searchedRestaurants: response.data.restaurants,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  updateOrderByRestaurant: async (
    orderId: string,
    restaurantId: string,
    status: string
  ) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(
        `${API_END_POINT}/${restaurantId}/order/${orderId}`,
        { status }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          adminRestaurant: response.data.restaurant,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
  setAppliedFilters: (appliedFilters: IAppliedFilters) => {
    set({ appliedFilters });
  },
  resetAppliedFilters: () => {
    set({ appliedFilters: {} as IAppliedFilters });
  },
});

export const useRestaurantStore = create<IRestaurantState>()(
  devtools(
    persist<IRestaurantState>(restaurantStore, {
      name: "restaurant-store",
      storage: createJSONStorage(() => localStorage),
    }),
    {
      name: "Restaurant-Store",
    }
  )
);
