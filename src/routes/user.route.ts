import { Router } from "express";
import { login, register, verifyemailOtp } from "../controllers/user.controller";
import { verifyEmailTokenMiddleWare } from "../middlewares/user.middleware";

const router = Router();

router.post("/register", register);
router.post("/verifyemailotp", verifyEmailTokenMiddleWare, verifyemailOtp);
router.post("/login", login)
export default router;
