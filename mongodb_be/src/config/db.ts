import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('MongoDB connected successfully via Prisma');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export { prisma, connectDB }; 