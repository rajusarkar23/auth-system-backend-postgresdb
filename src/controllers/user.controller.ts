import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"

const prisma = new PrismaClient();

// user register
const register = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const verificationOtp = Math.floor(Math.random() * 1000000)
    const otp = verificationOtp.toString()
    console.log(otp);
    
    const hashedOtp = await bcrypt.hash(otp,10)

    // data validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verified: false,
        role: 'USER',
        otp: hashedOtp
      },
    });

    //create token
    const jwt_token = jwt.sign({userId: user.id}, `${process.env.VERIFY_EMAIL_JWT_SECRET}`, {expiresIn: "455m"})
    // return the user
    return res.cookie("verifyEmailToken", jwt_token).status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified,
        role: user.role,
        otp: user.otp,
        jwt_token
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

const verifyemail = async (req: any, res: any) => {
  const { otp } = req.body
  const  id = req.userId

  try {
    // grab the user
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id)
      }
    })
    // check does user available
    if (!user) {
      console.log("User not found");
    } 
    // grab user otp from db
    const userOtp = user!.otp
    // compare the otp
    const comparedOtp = bcrypt.compareSync(otp, userOtp)

    if (!comparedOtp) {
      return res.status(400).json({success: false, message: "Wrong OTP"})
    }

    const jwt_token = jwt.sign({userId: user?.id}, `${process.env.sessionToken_JWT_SECRET}`)

    return res.cookie("sessionToken", jwt_token).status(200).json({success: true, message: "Correct OTP", jwt_token})
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Something went wrong"})
  }

  
}

export {register, verifyemail}
