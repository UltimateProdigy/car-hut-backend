import { NextFunction, Response } from "express";
import { bidService } from "../services/bidService";
import { AuthenticatedRequest } from "../types";

export const bidController = {
  async placeBid(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { carId } = req.params;
      const { amount } = req.body;

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid bid amount is required",
        });
      }

      const bid = await bidService.placeBid(carId, req.user.id, amount);

      res.status(201).json({
        success: true,
        message: "Bid placed successfully",
        data: bid,
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

  async getBidsByCar(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { carId } = req.params;
      const bids = await bidService.getBidsByCar(carId);

      res.status(200).json({
        success: true,
        count: bids.length,
        data: bids,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyBids(
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

      const bids = await bidService.getBidsByUser(req.user.id);

      res.status(200).json({
        success: true,
        count: bids.length,
        data: bids,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyWinningBids(
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

      const bids = await bidService.getWinningBidsByUser(req.user.id);

      res.status(200).json({
        success: true,
        count: bids.length,
        data: bids,
      });
    } catch (error) {
      next(error);
    }
  },

  async getHighestBid(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { carId } = req.params;
      const bid = await bidService.getHighestBid(carId);

      if (!bid) {
        return res.status(404).json({
          success: false,
          message: "No bids found for this car",
        });
      }

      res.status(200).json({
        success: true,
        data: bid,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBidStatistics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { carId } = req.params;
      const stats = await bidService.getBidStatistics(carId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async checkUserBid(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { carId } = req.params;

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const hasBid = await bidService.hasUserBidOnCar(carId, req.user.id);

      res.status(200).json({
        success: true,
        data: { hasBid },
      });
    } catch (error) {
      next(error);
    }
  },

  async closeAuction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { carId } = req.params;

      const result = await bidService.closeAuction(carId);

      res.status(200).json({
        success: result.success,
        message: result.message,
        data: result.success
          ? {
              winner: result.winner,
              winningBid: result.winningBid,
            }
          : null,
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
};
