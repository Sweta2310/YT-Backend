import { Router } from "express";
import { shareVideo } from "../controllers/share.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/:videoId", verifyJWT, shareVideo);

export default router;
