import axios from "axios";
import { toast } from "sonner";
import { create, StateCreator } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { IFavourites, IFavouritesState } from "@/types/favourites";

const API_END_POINT = `/api/v1`;
axios.defaults.withCredentials = true;

const favouritesStore: StateCreator<IFavouritesState> = (set) => ({
  isLoading: true,
  favourites: [] as IFavourites[],
  addToFavourites: async (orderId: string) => {
    try {
      set({ isLoading: true });
      const { data } = await axios.post(`${API_END_POINT}/favourites`, {
        orderId,
      });
      set((state) => ({
        favourites: [...state.favourites, data.favourite],
      }));
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
  removeFromFavourites: async (orderId: string) => {
    try {
      set({ isLoading: true });
      const { data } = await axios.delete(`${API_END_POINT}/orders/${orderId}`);
      set((state) => ({
        favourites: state.favourites.filter(
          (favourite: IFavourites) => favourite.orderId !== orderId
        ),
      }));
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
  getFavourites: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get(`${API_END_POINT}/favourites`);
      set({ favourites: data.favourites });
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
});

export const useFavouriteStore = create<IFavouritesState>()(
  devtools(
    persist(favouritesStore, {
      name: "favourites-store",
      storage: createJSONStorage(() => localStorage),
    }),
    {
      name: "Favourites-Store",
    }
  )
);
