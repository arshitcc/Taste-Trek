import { create, StateCreator } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";
import { ICartItem, ICartState, ICart } from "@/types/cart";
import axios from "axios";
import { toast } from "sonner";

const API_END_POINT = `${import.meta.env.VITE_API_URL}/api/v1/cart`;
axios.defaults.withCredentials = true;

const cartStore: StateCreator<ICartState> = (set) => ({
  isLoading: true,
  carts: [] as ICart[],
  items: [] as ICartItem[],

  addToCart: async (restaurantId: string, cartItem: ICartItem) => {
    try {
      set({ isLoading: true });
      set((state) => ({
        items: state.items.some((item) => item.foodId === cartItem.foodId)
          ? state.items.map((item) =>
              item.foodId === cartItem.foodId
                ? { ...item, quantity: cartItem.quantity }
                : item
            )
          : [...state.items, cartItem],

        carts: state.carts.some((cart) => cart.restaurant._id === restaurantId)
          ? state.carts.map((cart) =>
              cart.restaurant._id === restaurantId
                ? { ...cart, items: [...cart.items, cartItem] }
                : cart
            )
          : [
              ...state.carts,
              {
                _id: "",
                userId: "",
                restaurantId: restaurantId,
                restaurant: { _id: restaurantId },
                items: [cartItem],
              },
            ],
      }));
      const { data } = await axios.post(
        `${API_END_POINT}/${restaurantId}`,
        cartItem
      );
      set({ items: data.data.cart.items });

      toast.success(data.message);
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(
        error.response?.data?.message || "Failed to add item to cart"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (restaurantId: string, foodId: string) => {
    try {
      set({ isLoading: true });
      set((state) => ({
        items: state.items.filter((item) => item.foodId !== foodId),
      }));
      const { data } = await axios.patch(`${API_END_POINT}/${restaurantId}`, {
        foodId,
      });

      if (data.data.cart.items.length === 0) {
        await axios.delete(`${API_END_POINT}/${restaurantId}`);
        set((state) => ({
          carts: state.carts.filter(
            (cart) => cart.restaurant._id !== restaurantId
          ),
        }));
      }
      set({ items: data.data.cart.items });
      toast.success(data.message);
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(
        error.response?.data?.message || "Failed to remove item from cart"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCart: async (restaurantId: string) => {
    try {
      set({ isLoading: true });
      const { data } = await axios.delete(`${API_END_POINT}/${restaurantId}`);
      set({ items: [] });
      set((state) => ({
        carts: state.carts.filter(
          (cart) => cart.restaurant._id !== restaurantId
        ),
      }));
      toast.success(data.message);
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response?.data?.message || "Failed to delete cart");
    } finally {
      set({ isLoading: false });
    }
  },

  getCartItems: async (restaurantId: string) => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get(`${API_END_POINT}/${restaurantId}`);
      set({ items: data.data.cart[0].items });
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(
        error.response?.data?.message || "Failed to retrieve cart items"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  getCarts: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get(`${API_END_POINT}`);
      set({ carts: data.data });
    } catch (error: any) {
      if (error.response?.status === 401) localStorage.clear();
      toast.error(error.response?.data?.message || "Failed to retrieve carts");
    } finally {
      set({ isLoading: false });
    }
  },
});

export const useCartStore = create<ICartState>()(
  devtools(
    persist<ICartState>(cartStore, {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }),
    {
      name: "Cart-Store",
    }
  )
);
