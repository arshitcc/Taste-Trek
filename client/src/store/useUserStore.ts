import { create, StateCreator } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import axios from "axios";
import { toast } from "sonner";
import { IAddress, IUser, IUserState } from "@/types/user";
import { UserSignupSchema, UserLoginSchema } from "@/schemas/user";

const API_END_POINT = `${import.meta.env.VITE_API_URL}/api/v1/users`;
axios.defaults.withCredentials = true;

const userStore: StateCreator<IUserState> = (set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  signup: async (userData: UserSignupSchema) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(`${API_END_POINT}/signup`, userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          user: response.data.data,
          isAuthenticated: true,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },

  login: async (userData: UserLoginSchema) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(
        `${API_END_POINT}/login`,
        { user: userData.user, password: userData.password },
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
          user: response.data.data,
          isAuthenticated: true,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.post(`${API_END_POINT}/logout`);
      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          user: null,
          isAuthenticated: false,
        });
        localStorage.clear();
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },

  updateProfile: async (
    userData: Pick<IUser, "fullname" | "email" | "username" | "phone">
  ) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch( 
        `${API_END_POINT}/update-profile`,
        userData,
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
          user: response.data.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },

  updatePassword: async (userData: {
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(
        `${API_END_POINT}/update-password`,
        userData,
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
          user: response.data.user,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },

  updateAvatar: async (userData: FormData) => {
    try {
      set({ isLoading: true });
      const response = await axios.patch(
        `${API_END_POINT}/update-avatar`,
        userData,
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
          user: response.data.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },

  addNewAddress: async (userAddress: IAddress) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(
        `${API_END_POINT}/add-new-address`,
        userAddress,
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
          user: response.data.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },

  removeAddress: async (addressId: string) => {
    try {
      set({ isLoading: true });
      const response = await axios.delete(
        `${API_END_POINT}/remove-address/${addressId}`
      );
      if (response.data.success) {
        toast.success(response.data.message);
        set({
          isLoading: false,
          user: response.data.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      set({ isLoading: false });
    }
  },
});

export const useUserStore = create<IUserState>()(
  devtools(
    persist<IUserState>(userStore, {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
    }),
    {
      name: "User-Store",
    }
  )
);
