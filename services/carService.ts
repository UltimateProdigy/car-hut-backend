import { Prisma, PrismaClient } from "@prisma/client";
import { CreateCarInput } from "../types";
import { cleanUpdateData } from "../utils/helper";

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
        brand_id: data.brand_id,
        category_id: data.category_id,
        user_id: data.user_id,
        vin: data.vin,
        licensePlate: data.licensePlate,
        auction_start_date: data.auction_start_date,
        auction_end_date: data.auction_end_date,
        reserve_price: data.reserve_price,
        buy_now_price: data.buy_now_price,
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

  async getCars(filters?: {
    status?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    activeAuctions?: boolean;
  }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.isActive !== undefined) where.is_active = filters.isActive;
    if (filters?.isFeatured !== undefined)
      where.is_featured = filters.isFeatured;

    if (filters?.activeAuctions) {
      const now = new Date();
      where.auction_start_date = { lte: now };
      where.auction_end_date = { gte: now };
      where.status = "AVAILABLE";
    }

    return await prisma.car.findMany({
      where,
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
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { created_at: "desc" },
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
        bids: {
          orderBy: { amount: "desc" },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profile_picture: true,
              },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
    });
  },

  async updateCar(id: string, data: Partial<CreateCarInput>) {
    return await prisma.car.update({
      where: { id },
      data: cleanUpdateData(data) as Prisma.CarUncheckedUpdateInput,
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

  async deleteCar(id: string) {
    return await prisma.car.delete({
      where: { id },
    });
  },

  async getCarsByUserId(userId: string) {
    return await prisma.car.findMany({
      where: { user_id: userId },
      include: {
        brand: true,
        category: true,
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  async isAuctionActive(carId: string): Promise<boolean> {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: {
        auction_start_date: true,
        auction_end_date: true,
        status: true,
      },
    });

    if (!car || car.status !== "AVAILABLE") return false;

    const now = new Date();
    return (
      car.auction_start_date !== null &&
      car.auction_end_date !== null &&
      now >= car.auction_start_date &&
      now <= car.auction_end_date
    );
  },
};
