import { Router } from "express";
import { checkusernameUnique, checkvalidjwt, googleauth, login, register, verifyemailOtp } from "../controllers/user.controller";
import { validUser, verifyEmailJwtTokenMiddleWare } from "../middlewares/user.middleware";

const router = Router();

router.post("/register", register);
router.post("/verifyemailotp", verifyEmailJwtTokenMiddleWare, verifyemailOtp);
router.post("/login", login);
router.post("/checkusernameUnique", checkusernameUnique)
router.post("/googleauth", googleauth)
router.post("/checkvalidjwt", validUser, checkvalidjwt)
export default router;
