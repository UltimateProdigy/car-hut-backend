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
      const cars = await carService.getCars();

      res.status(200).json({
        success: true,
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

      res.status(200).json({
        success: true,
        data: car,
      });
    } catch (error) {
      next(error);
    }
  },
};
