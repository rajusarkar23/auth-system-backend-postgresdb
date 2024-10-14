import { Router } from "express";
import { register, verifyemail } from "../controllers/user.controller";

const router = Router()

router.post("/register", register)
router.post("/verifyemail", verifyemail)
export default router