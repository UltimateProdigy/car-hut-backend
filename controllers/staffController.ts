import { NextFunction, Response } from "express";
import { staffService } from "../services/staffService";
import { AuthenticatedRequest, UpdateUserInput } from "../types";

export const staffController = {
  async getAllStaff(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const staff = await staffService.getAllStaff();

      res.status(200).json({
        success: true,
        count: staff.length,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStaffById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const staff = await staffService.getStaffById(id);

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: "Staff not found",
        });
      }

      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStaff(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const updateData: UpdateUserInput = req.body;

      const staff = await staffService.updateStaff(id, updateData);

      res.status(200).json({
        success: true,
        message: "Staff updated successfully",
        data: staff,
      });
    } catch (error: any) {
      if (error.message) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  async deleteStaff(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      await staffService.deleteStaff(id);

      res.status(200).json({
        success: true,
        message: "Staff deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
