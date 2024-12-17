import { Router } from "express";
import {
  initiateOrder,
  updateOrderByRestaurant,
  updateOrderByUser,
  completeOrder,
  cancelOrderByRestaurant,
  cancelOrderByUser,
  getUserOrders,
  getRestaurantOrders,
  getOrderDetails,
} from "../controllers/order.controllers";
import {
  verifyJWT,
  verifyRestaurantOwner,
} from "../middlewares/auth.middleware";
import {
  addToFavourites,
  removeFromFavourites,
} from "../controllers/favourites.controllers";

const router = Router();

router
  .route("/restaurant/:restaurantId")
  .get(verifyJWT, verifyRestaurantOwner, getRestaurantOrders);
router
  .route("/:restaurantId/cancel/:orderId")
  .patch(verifyJWT, verifyRestaurantOwner, cancelOrderByRestaurant);
router
  .route("/:restaurantId/update/:orderId")
  .patch(verifyJWT, verifyRestaurantOwner, updateOrderByRestaurant);

router.route("/:restaurantId/initiate").post(verifyJWT, initiateOrder);
router
  .route("/:orderId")
  .get(verifyJWT, getOrderDetails)
  .post(verifyJWT, addToFavourites)
  .delete(verifyJWT, removeFromFavourites);

router.route("/:orderId/complete").patch(verifyJWT, completeOrder);
router.route("/:orderId/cancel").patch(verifyJWT, cancelOrderByUser);
router.route("/:orderId/update").patch(verifyJWT, updateOrderByUser);
router.route("/").get(verifyJWT, getUserOrders);

export default router;
