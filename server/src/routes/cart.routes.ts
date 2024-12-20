import { Router } from "express";
import { addToCart, removeFromCart, getCartItems, getCarts, deleteCart } from "../controllers/cart.controllers";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/:restaurantId")
.get(verifyJWT, getCartItems)
.post(verifyJWT, addToCart)
.patch(verifyJWT, removeFromCart)
.delete(verifyJWT, deleteCart);

router.route("/").get(verifyJWT, getCarts);

export default router;