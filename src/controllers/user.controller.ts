import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const register = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
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
      },
    });
    // return the user
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export {register}
