import { Router } from "express";
import { getFavourites } from "../controllers/favourites.controllers";

import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/").get(verifyJWT, getFavourites);

export default router;
