import { Router } from "express";
import { register, verifyemailOtp } from "../controllers/user.controller";
import { verifyEmailTokenMiddleWare } from "../middlewares/user.middleware";

const router = Router()

router.post("/register", register)
router.post("/verifyemailotp",verifyEmailTokenMiddleWare, verifyemailOtp)
export default router