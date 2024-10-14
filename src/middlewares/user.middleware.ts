import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export function verifyEmailTokenMiddleWare (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"] ?? "";

    if (!authHeader) {
        console.log("not authorized!!!");
        return
    }

    try {
        const decode = jwt.verify(authHeader, `${process.env.VERIFY_EMAIL_JWT_SECRET}`)
        //@ts-ignore
        const userId = decode.userId
        //@ts-ignore
        req.userId = userId
        return next()
    } catch (error) {
        console.log(error);
        return
    }
}