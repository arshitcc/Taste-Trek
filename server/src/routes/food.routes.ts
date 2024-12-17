import { Router } from "express";
import {
  addFoodItem,
  removeFoodItem,
  getRestaurantMenu,
  updateFoodItemDetails,
  updateFoodImage,
  toggleFoodAvailability,
} from "../controllers/food.controllers";
import { upload } from "../middlewares/multer.middleware";
import {
  verifyJWT,
  verifyRestaurantOwner,
} from "../middlewares/auth.middleware";

const router = Router();

router
  .route("/:restaurantId")
  .get(verifyJWT, verifyRestaurantOwner, getRestaurantMenu);
router
  .route("/:restaurantId/add-food")
  .post(verifyJWT, verifyRestaurantOwner, upload.single("image"), addFoodItem);

router
  .route("/:restaurantId/food/:foodId")
  .delete(verifyJWT, verifyRestaurantOwner, removeFoodItem)
  .patch(verifyJWT, verifyRestaurantOwner, updateFoodItemDetails);

router
  .route("/:restaurantId/food/:foodId/update-image")
  .patch(
    verifyJWT,
    verifyRestaurantOwner,
    upload.single("image"),
    updateFoodImage
  );
router
  .route("/:restaurantId/food/:foodId/toggle-availability")
  .patch(verifyJWT, verifyRestaurantOwner, toggleFoodAvailability);

export default router;
