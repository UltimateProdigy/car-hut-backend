import { NextFunction, Response } from "express";
import { carService } from "../services/carService";
import { AuthenticatedRequest, CreateCarInput } from "../types";

export const carController = {
  async createCar(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const carData: CreateCarInput = req.body.data
        ? JSON.parse(req.body.data)
        : req.body;

      if (req.user?.id) {
        carData.user_id = req.user.id;
      }

      const car = await carService.createCar(carData);

      res.status(201).json({
        success: true,
        message: "Car created successfully",
        data: car,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCars(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, isActive, isFeatured, activeAuctions } = req.query;
      const filters: any = {};

      if (status) filters.status = status as string;
      if (isActive !== undefined) filters.isActive = isActive === "true";
      if (isFeatured !== undefined) filters.isFeatured = isFeatured === "true";
      if (activeAuctions !== undefined)
        filters.activeAuctions = activeAuctions === "true";

      const cars = await carService.getCars(filters);

      res.status(200).json({
        success: true,
        count: cars.length,
        data: cars,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCarById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const car = await carService.getCarById(id);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: "Car not found",
        });
      }

      const isActive = await carService.isAuctionActive(id);

      res.status(200).json({
        success: true,
        data: {
          ...car,
          isAuctionActive: isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCar(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const updateData: Partial<CreateCarInput> = req.body.data
        ? JSON.parse(req.body.data)
        : req.body;

      const existingCar = await carService.getCarById(id);

      if (!existingCar) {
        return res.status(404).json({
          success: false,
          message: "Car not found",
        });
      }

      if (existingCar.user_id !== req.user?.id && req.user?.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this car",
        });
      }

      const car = await carService.updateCar(id, updateData);

      res.status(200).json({
        success: true,
        message: "Car updated successfully",
        data: car,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCar(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const existingCar = await carService.getCarById(id);

      if (!existingCar) {
        return res.status(404).json({
          success: false,
          message: "Car not found",
        });
      }

      if (existingCar.user_id !== req.user?.id && req.user?.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this car",
        });
      }

      if (existingCar._count && existingCar._count.bids > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete car with existing bids",
        });
      }

      await carService.deleteCar(id);

      res.status(200).json({
        success: true,
        message: "Car deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyListings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const cars = await carService.getCarsByUserId(req.user.id);

      res.status(200).json({
        success: true,
        count: cars.length,
        data: cars,
      });
    } catch (error) {
      next(error);
    }
  },

  async getActiveAuctions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const cars = await carService.getCars({ activeAuctions: true });

      res.status(200).json({
        success: true,
        count: cars.length,
        data: cars,
      });
    } catch (error) {
      next(error);
    }
  },
};
