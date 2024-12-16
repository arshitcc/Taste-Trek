import { Router } from "express";
import {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsByCuisine,
  getRestaurantsByLocation,
  toggleRestaurantStatus,
  getFeaturedRestaurants,
  getRestaurantByID,
  updateOrderStatus,
  getQueryRestaurants,
  getAdminRestaurant,
} from "../controllers/restaurant.controllers";
import {
  verifyJWT,
  verifyRestaurantOwner,
} from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/:restaurantId").get(getRestaurantByID);

router.route("/search/:searchText").get(getQueryRestaurants);
router.route("/cuisine/:cuisine").get(getRestaurantsByCuisine);
router.route("/location/:city").get(getRestaurantsByLocation);
router.route("/featured/:city").get(getFeaturedRestaurants);

router.route("/admin").post(upload.single("image"), createRestaurant);
router
  .route("/admin/:restaurantId")
  .get(verifyRestaurantOwner, getAdminRestaurant)
  .patch(verifyRestaurantOwner, updateRestaurant)
  .delete(verifyRestaurantOwner, deleteRestaurant);

router
  .route("/admin/:restaurantId/toggle-status")
  .patch(verifyRestaurantOwner, toggleRestaurantStatus);
router
  .route("/admin/:restaurantId/update/:orderId")
  .patch(verifyRestaurantOwner, updateOrderStatus);

export default router;
