import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export function verifyEmailJwtTokenMiddleWare (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"] ?? "";
    console.log(authHeader);
    

    if (!authHeader) {
        console.log("not authorized!!!");
        return
    }

    try {
        const decode = jwt.verify(authHeader, `${process.env.VERIFY_EMAIL_JWT_SECRET}`)
        console.log(decode);
        
        //@ts-ignore
        const userId = decode.userId
        console.log(userId);
        //@ts-ignore
        req.userId = userId
        return next()
    } catch (error) {
        console.log(error);
        return
    }
}

export function validUser (req: any, res: any, next: NextFunction){
    const authHeader = req.headers["authorization"] ?? ""
    console.log(authHeader);
    
    if (!authHeader) {
        console.log("No auth header available.");
        return
    }
    try {
        const decode = jwt.verify(authHeader, `${process.env.sessionToken_JWT_SECRET}`)
        if (!decode) {
            console.log("abcd");
            return
        }
        console.log(decode);
        //@ts-ignore
        req.userId = decode.userId
        return next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          // Handle token expired error
          console.log('Token expired');
          return res.status(400).json({success: false, message: "Token expired"})
        } else if (error instanceof jwt.JsonWebTokenError) {
          // Handle other token errors
          console.log('Invalid token');
          return res.status(400).json({success: false, message: "Invalid"})
        } else {
          // Handle other errors
          console.error(error);
          return res.status(400).json({success: false, message: "Something went wrong"})
        }
      }
}