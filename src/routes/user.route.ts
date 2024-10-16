import { Router } from "express";
import { checkusernameUnique, login, register, verifyemailOtp } from "../controllers/user.controller";
import { verifyEmailTokenMiddleWare } from "../middlewares/user.middleware";

const router = Router();

router.post("/register", register);
router.post("/verifyemailotp", verifyEmailTokenMiddleWare, verifyemailOtp);
router.post("/login", login);
router.post("/checkusernameUnique", checkusernameUnique)
export default router;
