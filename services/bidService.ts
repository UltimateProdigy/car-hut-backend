import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const bidService = {
  async placeBid(carId: string, userId: string, amount: number) {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
        },
      },
    });

    if (!car) {
      throw new Error("Car not found");
    }

    const now = new Date();
    if (
      !car.auction_start_date ||
      !car.auction_end_date ||
      now < car.auction_start_date ||
      now > car.auction_end_date
    ) {
      throw new Error("Auction is not active");
    }

    if (car.status !== "AVAILABLE") {
      throw new Error("Car is not available for bidding");
    }

    if (car.user_id === userId) {
      throw new Error("You cannot bid on your own car");
    }

    const currentHighestBid = car.bids[0]?.amount || car.price;

    if (amount <= currentHighestBid) {
      throw new Error(
        `Bid must be higher than current bid of $${currentHighestBid}`
      );
    }
    if (car.reserve_price && amount < car.reserve_price) {
      console.log("Bid does not meet reserve price");
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.bid.updateMany({
        where: { car_id: carId },
        data: { is_winning: false },
      });

      const newBid = await tx.bid.create({
        data: {
          amount,
          car_id: carId,
          user_id: userId,
          is_winning: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile_picture: true,
            },
          },
          car: {
            select: {
              id: true,
              name: true,
              model: true,
              image_url: true,
            },
          },
        },
      });

      await tx.car.update({
        where: { id: carId },
        data: { current_bid: amount },
      });

      return newBid;
    });

    return result;
  },

  async getBidsByCar(carId: string) {
    return await prisma.bid.findMany({
      where: { car_id: carId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_picture: true,
          },
        },
      },
      orderBy: { amount: "desc" },
    });
  },

  async getBidsByUser(userId: string) {
    return await prisma.bid.findMany({
      where: { user_id: userId },
      include: {
        car: {
          include: {
            brand: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  async getWinningBidsByUser(userId: string) {
    return await prisma.bid.findMany({
      where: {
        user_id: userId,
        is_winning: true,
      },
      include: {
        car: {
          include: {
            brand: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  async getBidById(bidId: string) {
    return await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_picture: true,
          },
        },
        car: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
    });
  },

  async getHighestBid(carId: string) {
    return await prisma.bid.findFirst({
      where: { car_id: carId },
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
    });
  },

  async hasUserBidOnCar(carId: string, userId: string) {
    const bid = await prisma.bid.findFirst({
      where: {
        car_id: carId,
        user_id: userId,
      },
    });
    return !!bid;
  },

  async getBidStatistics(carId: string) {
    const bids = await prisma.bid.findMany({
      where: { car_id: carId },
      select: { amount: true },
    });

    const totalBids = bids.length;
    const amounts = bids.map((b) => b.amount);
    const highestBid = amounts.length > 0 ? Math.max(...amounts) : 0;
    const lowestBid = amounts.length > 0 ? Math.min(...amounts) : 0;
    const averageBid =
      amounts.length > 0
        ? amounts.reduce((a, b) => a + b, 0) / amounts.length
        : 0;

    const uniqueBidders = await prisma.bid.findMany({
      where: { car_id: carId },
      select: { user_id: true },
      distinct: ["user_id"],
    });

    return {
      totalBids,
      uniqueBidders: uniqueBidders.length,
      highestBid,
      lowestBid,
      averageBid: Math.round(averageBid * 100) / 100,
    };
  },

  async closeAuction(carId: string) {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          include: {
            user: true,
          },
        },
      },
    });

    if (!car) {
      throw new Error("Car not found");
    }

    const highestBid = car.bids[0];

    if (
      car.reserve_price &&
      (!highestBid || highestBid.amount < car.reserve_price)
    ) {
      await prisma.car.update({
        where: { id: carId },
        data: { status: "AVAILABLE" },
      });
      return {
        success: false,
        message: "Reserve price not met",
      };
    }

    if (!highestBid) {
      await prisma.car.update({
        where: { id: carId },
        data: { status: "AVAILABLE" },
      });
      return {
        success: false,
        message: "No bids received",
      };
    }

    await prisma.car.update({
      where: { id: carId },
      data: { status: "SOLD" },
    });

    return {
      success: true,
      message: "Auction closed successfully",
      winner: highestBid.user,
      winningBid: highestBid.amount,
    };
  },
};
