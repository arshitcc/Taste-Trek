import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  userSignup,
  userLogin,
  userLogout,
  refreshAccessToken,
  getUser,
  updatePassword,
  updateProfile,
  updateAvatar,
  addNewAddress,
  removeAddress,
} from "../controllers/user.controllers";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.route("/signup").post(upload.single("avatar"), userSignup);
router.route("/login").post(userLogin);
router.route("/logout").post(verifyJWT, userLogout);
router.route("/refresh-user").post(verifyJWT, refreshAccessToken);
router.route("/update-password").patch(verifyJWT, updatePassword);
router.route("/update-profile").patch(verifyJWT, updateProfile);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/add-new-address").post(verifyJWT, addNewAddress);
router.route("/remove-address/:addressId").delete(verifyJWT, removeAddress);
router.route("/:userId").get(verifyJWT, getUser);

export default router;
