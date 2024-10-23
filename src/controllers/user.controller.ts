import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// initialize prisma client
const prisma = new PrismaClient();

// user register
const register = async (req: any, res: any) => {
  try {
    // Grab email and password
    const { email, username, password } = req.body;

    // nodemailer logic
    const sender = process.env.EMAIL;
    const mailPassword = process.env.EMAIL_PASSWORD;
    // create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: sender,
        pass: mailPassword,
      },
    });

    // Create otp generator func
    function generateOtp(l = 6) {
      let otp = "";
      for (let i = 0; i < l; i++) {
        otp += Math.floor(Math.random() * 10);
      }
      return otp;
    }
    // hold otp in a variable
    const otp = generateOtp();
    // hash the otp
    const hashedOtp = await bcrypt.hash(otp, 10);
    // data validate
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    // check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email or username." });
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create the user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        verified: false,
        role: "USER",
        otp: hashedOtp,
      },
    });
    console.log(otp);

    // create token
    const jwt_token = jwt.sign(
      { userId: user.id },
      `${process.env.VERIFY_EMAIL_JWT_SECRET}`,
      { expiresIn: "455m" }
    );
    // send mail
    const sendMAil = await transporter.sendMail({
      from: sender,
      to: email,
      replyTo: sender,
      subject: `Verification OTP`,
      html: `
       <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 0; margin: 0; width: 100%; height: 100%;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 100%; height: 100%; background-color: #f4f4f4; text-align: center;">
        <tr>
          <td style="padding: 40px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
              <tr>
                <td>
                  <h2 style="color: #333333; margin-bottom: 20px;">Here is your OTP</h2>
                  <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">Welcome onboard, Please verify your email with the below OTP.</p>
                  <p style="font-size: 18px; color: #333333; margin-bottom: 30px;"><strong>OTP: ${otp}</strong></p>
                  <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">From: ${sender}</p>
                  <p style="font-size: 14px; color: #777777;">This is an automated message, please do not reply.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
        `,
    });

    console.log(sendMAil);
    // return the user
    return res
      .cookie("verifyEmailToken", jwt_token)
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          verified: user.verified,
          role: user.role,
          otp: user.otp,
          jwt_token,
        },
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

//=> Verify email otp
const verifyemailOtp = async (req: any, res: any) => {
  const { otp } = req.body;
  const id = req.userId;

  try {
    // grab the user
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    // check does user available
    if (!user) {
      console.log("User not found");
    }
    // grab user otp from db
    const userOtp = user!.otp;
    // compare the otp
    const comparedOtp = bcrypt.compareSync(otp, userOtp);

    if (!comparedOtp) {
      return res.status(400).json({ success: false, message: "Wrong OTP" });
    }
    // update verification field
    await prisma.user.update({
      where: {
        email: user!.email,
      },
      data: {
        verified: true,
      },
    });
    // sign jwt
    const jwt_token = jwt.sign(
      { userId: user?.id },
      `${process.env.sessionToken_JWT_SECRET}`
    );
    // return res
    return res
      .cookie("sessionToken", jwt_token)
      .status(200)
      .json({ success: true, message: "Correct OTP", jwt_token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//=> Login
const login = async (req: any, res: any) => {
  // grab the client side data
  const { usernameOrEmail, password } = req.body;
  // check if data exists or not
  if (!usernameOrEmail || !password) {
    return res
      .status(400)
      .json({ message: "Both credential fields are required." });
  }
  // find the user with provided email
  const findUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    },
  });
  console.log(findUser);

  // if not found
  if (!findUser) {
    return res.status(400).json({ success: false, message: "User not found" });
  }
  // if found
  const dbPassword = findUser.password;
  const comparePassword = bcrypt.compareSync(password, dbPassword);

  // password comparison failed
  if (!comparePassword) {
    return res
      .status(400)
      .json({ success: false, message: "Wrong credentials" });
  }

  if (findUser.verified === false) {
    console.log("Not verified");
    return res.status(400).json({
      success: false,
      message: "Before login please verify with otp.",
    });
  }
  // comparison success
  const jwt_token = jwt.sign(
    { userId: findUser.id },
    `${process.env.sessionToken_JWT_SECRET}`,
    { expiresIn: "45m" }
  );

  return res
    .cookie("sessionToken", jwt_token)
    .status(200)
    .json({ success: true, message: "Login success", jwt_token });
};

//=> Check username unique
const checkusernameUnique = async (req: any, res: any) => {
  const { username } = req.body;
  console.log("hitted");
  console.log(username);
  const checkusernameUnique = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (checkusernameUnique) {
    return res
      .status(400)
      .json({ success: false, message: "Username already taken" });
  }

  return res
    .status(200)
    .json({ success: true, message: "Username is available" });
};

//=> Google Oauth

const googleauth = async (req: any, res: any) => {
  const {email, name} = req.body
  
  const user = await prisma.user.findUnique({
    where:{
      email: email
    }
  })

  if (user) {
    const jwt_token = jwt.sign({userId : user.id}, `${process.env.sessionToken_JWT_SECRET}`, {expiresIn:"5m"})
    
    console.log(user);
    return res.cookie("sessionToken", jwt_token).status(200).json({success: true, message: "User found"})
  
  }

  // else

   // Create otp generator func
   function generateOtp(l = 6) {
    let otp = "";
    for (let i = 0; i < l; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }
  // hold otp in a variable
  const otp = generateOtp();
  // hash the otp
  const hashedOtp = await bcrypt.hash(otp, 10);

  const createANewUser = await prisma.user.create({
    data: {
      username: email,
      email: email,
      otp: hashedOtp,
      password: `${hashedOtp}+${process.env.AUTO_PASSWORD_GENERATOR_KEY}`
    }
  })

  console.log(createANewUser);

  const jwt_token = jwt.sign({userId: createANewUser.id}, `${process.env.sessionToken_JWT_SECRET}`, {expiresIn: "5m"})
  
  return res.cookie("sessionToken", jwt_token).status(201).json({success: true, message: "User created and redirecting to profile"})
  
}
const checkvalidjwt = async (req: any, res: any) => {
  const id  = req.userId;
  
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id)
    }
  })

  if (!user) {
    console.log("No user found");
    return res.status(400).json({success: false, message: "No user found"})
  }
  console.log(user);
  
  return res.status(200).json({success: true, message: "User found"})
  
}

export { register, verifyemailOtp, login, checkusernameUnique, googleauth, checkvalidjwt };
