import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserInput, LoginInput } from "../types";
import { config } from "../config/env";
import { generateToken } from "../utils/jwt";
import { staffService } from "./staffService";

const prisma = new PrismaClient();

export const authService = {
  async register(data: CreateUserInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === data.username) {
        throw new Error("Username already exists");
      }
      if (data.email && existingUser.email === data.email) {
        throw new Error("Email already exists");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        profile_picture: data.profile_picture,
      },
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture: true,
        role: true,
        created_at: true,
      },
    });

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return { user, token };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findFirst({
      where: { username: data.username },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    };
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, config.jwtSecret) as {
        id: string;
        username: string;
        role: string;
      };
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  },

  async registerStaff(data: CreateUserInput) {
    const existingStaff = await prisma.staff.findFirst({
      where: {
        OR: [
          { username: data.username },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (existingStaff) {
      if (existingStaff.username === data.username) {
        throw new Error("Username already exists");
      }
      if (data.email && existingStaff.email === data.email) {
        throw new Error("Email already exists");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const staff = await prisma.staff.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        profile_picture: data.profile_picture,
      },
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture: true,
        role: true,
        created_at: true,
      },
    });

    const token = generateToken({
      id: staff.id,
      role: staff.role,
    });

    return { user: staff, token };
  },

  async loginStaff(data: LoginInput) {
    const staff = await prisma.staff.findFirst({
      where: { username: data.username },
    });

    if (!staff) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(data.password, staff.password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({
      id: staff.id,
      role: staff.role,
    });

    return {
      user: {
        id: staff.id,
        username: staff.username,
        email: staff.email,
        profile_picture: staff.profile_picture,
        role: staff.role,
        created_at: staff.created_at,
      },
      token,
    };
  },
};
