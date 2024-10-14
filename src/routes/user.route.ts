import { Router } from "express";
import { register, verifyemail } from "../controllers/user.controller";
import { verifyEmailTokenMiddleWare } from "../middlewares/user.middleware";

const router = Router()

router.post("/register", register)
router.post("/verifyemail",verifyEmailTokenMiddleWare, verifyemail)
export default router