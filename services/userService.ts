import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UpdateUserInput } from "../types";

const prisma = new PrismaClient();

export const userService = {
  async getAllUsers(filters?: { role?: string; search?: string }) {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.search) {
      where.OR = [
        { username: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture: true,
        role: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            cars: true,
            bids: true,
            favorites: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture: true,
        role: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            cars: true,
            bids: true,
            favorites: true,
          },
        },
      },
    });
  },

  async getUserProfile(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture: true,
        role: true,
        created_at: true,
        cars: {
          include: {
            brand: true,
            _count: {
              select: { bids: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
        bids: {
          include: {
            car: {
              include: {
                brand: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
        favorites: {
          include: {
            car: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    });
  },

  async updateUser(id: string, data: UpdateUserInput) {
    const updateData: any = {};

    if (data.username) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.profile_picture !== undefined)
      updateData.profile_picture = data.profile_picture;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture: true,
        role: true,
        updated_at: true,
      },
    });
  },

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  },

  async getUserStatistics(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cars: true,
            bids: true,
            favorites: true,
          },
        },
        bids: {
          where: { is_winning: true },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      totalListings: user._count.cars,
      totalBids: user._count.bids,
      winningBids: user.bids.length,
      totalFavorites: user._count.favorites,
    };
  },

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  },
};
