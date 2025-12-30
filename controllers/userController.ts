import { NextFunction, Response } from "express";
import { userService } from "../services/userService";
import { AuthenticatedRequest, UpdateUserInput } from "../types";

export const userController = {
  async getAllUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { role, search } = req.query;

      const users = await userService.getAllUsers({
        role: role as string,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyProfile(
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

      const profile = await userService.getUserProfile(req.user.id);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const updateData: UpdateUserInput = req.body;

      if (req.user?.id !== id && req.user?.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this user",
        });
      }

      const user = await userService.updateUser(id, updateData);

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error: any) {
      next(error);
    }
  },

  async deleteUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      if (req.user?.id !== id && req.user?.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this user",
        });
      }

      await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserStatistics(
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

      const stats = await userService.getUserStatistics(req.user.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Old password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      await userService.changePassword(req.user.id, oldPassword, newPassword);

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error: any) {
      next(error);
    }
  },
};
