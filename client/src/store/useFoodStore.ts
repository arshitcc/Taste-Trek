import { IFood, IFoodState } from "@/types/food";
import axios from "axios";
import { toast } from "sonner";
import { create, StateCreator } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";

const API_END_POINT = `/api/v1/foods`;
axios.defaults.withCredentials = true;

const foodStore: StateCreator<IFoodState> = (set) => ({
  adminMenu: [] as IFood[],
  isLoading: true,

  addFoodItemToRestaurant: async (restaurantId: string, foodData: FormData) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post(
        `${API_END_POINT}/${restaurantId}/add-food`,
        foodData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        set((state) => ({
          isLoading: false,
          adminMenu: [...state.adminMenu, data.data],
        }));
      }
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
  removeFoodItemFromRestaurant: async (
    restaurantId: string,
    foodId: string
  ) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.delete(
        `${API_END_POINT}/${restaurantId}/food/${foodId}`
      );
      if (data.success) {
        set((state) => ({
          isLoading: false,
          adminMenu: state.adminMenu.filter((food) => food._id !== foodId),
        }));
      }
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
  getRestaurantMenu: async (restaurantId: string) => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get(`${API_END_POINT}/${restaurantId}`);
      if (data.success) {
        set({ adminMenu: data.data, isLoading: false });
      }
    } catch (error: any) {
      toast.error(error.data.message);
      set({ isLoading: false });
    }
  },
  updateFoodItemDetails: async (
    restaurantId: string,
    foodId: string,
    foodData: Partial<IFood>
  ) => {
    set({ isLoading: true });
    try {
      const response = await axios.patch(
        `${API_END_POINT}/${restaurantId}/food/${foodId}`,
        foodData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        set((state) => ({
          isLoading: false,
          adminMenu: state.adminMenu.map((food) =>
            food._id === foodId ? response.data.data : food
          ),
        }));
      }
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
  updateFoodItemImage: async (
    restaurantId: string,
    foodId: string,
    foodImage: File
  ) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append("image", foodImage);
      const response = await axios.patch(
        `${API_END_POINT}/${restaurantId}/food/${foodId}/update-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        set((state) => ({
          isLoading: false,
          adminMenu: state.adminMenu.map((food) =>
            food._id === foodId ? response.data.data : food
          ),
        }));
      }
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
  toggleFoodAvailability: async (restaurantId: string, foodId: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.patch(
        `${API_END_POINT}/${restaurantId}/food/${foodId}/toggle-availability`
      );
      if (response.data.success) {
        set((state) => ({
          isLoading: false,
          adminMenu: state.adminMenu.map((food) =>
            food._id === foodId ? response.data.data : food
          ),
        }));
      }
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
});

export const useFoodStore = create<IFoodState>()(
  devtools(
    persist(foodStore, {
      name: "food-store",
      storage: createJSONStorage(() => localStorage),
    }),
    {
      name: "Food-Store",
    }
  )
);