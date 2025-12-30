import { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";
import { AuthenticatedRequest, CreateUserInput, LoginInput } from "../types";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: CreateUserInput = req.body;

      if (!userData.username || !userData.password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      if (userData.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      const result = await authService.register(userData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error: any) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginData: LoginInput = req.body;

      if (!loginData.username || !loginData.password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      const result = await authService.login(loginData);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  async getCurrentUser(
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

      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  },

  async registerStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staffData: CreateUserInput = req.body;

      if (!staffData.username || !staffData.password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      if (staffData.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      const result = await authService.registerStaff(staffData);

      res.status(201).json({
        success: true,
        message: "Staff registered successfully",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error: any) {
      next(error);
    }
  },

  async loginStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const loginData: LoginInput = req.body;

      if (!loginData.username || !loginData.password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      const result = await authService.loginStaff(loginData);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error: any) {
      next(error);
    }
  },
};
