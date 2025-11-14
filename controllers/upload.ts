import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "carhut",
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required" });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ message: "Image deleted", result });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
};
