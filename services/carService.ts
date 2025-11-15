import { PrismaClient } from "@prisma/client";
import { CreateCarInput } from "../types";

const prisma = new PrismaClient();

export const carService = {
  async createCar(data: CreateCarInput) {
    return await prisma.car.create({
      data: {
        name: data.name,
        model: data.model,
        year: data.year,
        price: data.price,
        description: data.description,
        mileage: data.mileage,
        image_url: data.image_url,
        images: data.images,
        location: data.location,
        fuel_type: data.fuel_type as any,
        transmission: data.transmission as any,
        engine_size: data.engine_size,
        horsepower: data.horsepower,
        color: data.color,
        body_type: data.body_type as any,
        brandId: data.brandId,
        categoryId: data.categoryId,
        userId: data.userId,
        vin: data.vin,
        licensePlate: data.licensePlate,
      },
      include: {
        brand: true,
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            profile_picture: true,
          },
        },
      },
    });
  },

  async getCars() {
    return await prisma.car.findMany({
      include: {
        brand: true,
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            profile_picture: true,
          },
        },
      },
    });
  },

  async getCarById(id: string) {
    return await prisma.car.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            profile_picture: true,
          },
        },
        features: true,
      },
    });
  },
};
