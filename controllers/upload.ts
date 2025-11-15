import { v2 as cloudinary } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import { config } from "../config/env";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export const getUploadSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: "uploads",
      },
      config.cloudinaryApiSecret
    );

    res.json({
      signature,
      timestamp,
      cloudName: config.cloudinaryCloudName,
      apiKey: config.cloudinaryApiKey,
      folder: "uploads",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: "Image deleted",
      result,
    });
  } catch (error) {
    next(error);
  }
};
