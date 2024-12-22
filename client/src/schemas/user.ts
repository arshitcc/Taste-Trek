import { z } from "zod";

export const userSignupSchema = z.object({
    fullname: z.string().min(3, { message: "Full name must be at least 3 characters long" }),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10).max(10, { message: "Phone number must be at most 10 characters long" }),
    password: z.string().min(8,"Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8,"Password must be at least 8 characters long"),
});

export const userLoginSchema = z.object({
    user: z.string().min(1, { message: "phone or email or is required" }),
    password: z.string().min(8).max(100, { message: "Password must be at most 10 characters long" }),
});

export type UserSignupSchema = z.infer<typeof userSignupSchema>;
export type UserLoginSchema = z.infer<typeof userLoginSchema>;