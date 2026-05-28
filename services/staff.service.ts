import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UpdateUserInput } from "../types";

const prisma = new PrismaClient();

export const staffService = {
  async getAllStaff() {
    return await prisma.staff.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: "desc" },
    });
  },

  async getStaffById(id: string) {
    return await prisma.staff.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  async updateStaff(id: string, data: UpdateUserInput) {
    const updateData: any = {};

    if (data.username) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.profile_picture !== undefined)
      updateData.profile_picture = data.profile_picture;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return await prisma.staff.update({
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

  async deleteStaff(id: string) {
    return await prisma.staff.delete({
      where: { id },
    });
  },
};
