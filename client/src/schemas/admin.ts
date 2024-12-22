import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().nonempty({ message: "Restaurant name is required" }),
  description: z.string().nonempty({ message: "Description is required" }),
  address: z.object({
    street: z.string().nonempty({ message: "Street is required" }),
    city: z.string().nonempty({ message: "City is required" }),
    state: z.string().nonempty({ message: "State is required" }),
    country: z.string().nonempty({ message: "Country is required" }),
    pincode: z.string().nonempty({ message: "Pincode is required" }),
    location: z.object({
      latitude: z.number({ message: "Latitude must be an integer" }),
      longitude: z.number({ message: "Longitude must be an integer" }),
    }),
  }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().nonempty({ message: "Phone number is required" }),
  gst: z.string().nonempty({ message: "GST number is required" }),
  averageCostForTwo: z
    .string()
    .regex(/^[0-9]+$/, "Enter a valid amount"),
  cuisine: z.array(z.string()),
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => file?.size !== 0, { message: "Image file is required" }),
});

export const createFoodItemSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  description: z.string().nonempty({ message: "description is required" }),
  price: z.number().min(0, { message: "Price can not be negative" }),
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => file?.size !== 0, { message: "Image file is required" }),
});

export type CreateRestaurantSchema = z.infer<typeof createRestaurantSchema>;
export type CreateFoodItemSchema = z.infer<typeof createFoodItemSchema>;
