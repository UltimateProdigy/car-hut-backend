import { Role } from "@prisma/client";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    username?: string;
  };
}

export interface CreateCarInput {
  name: string;
  model: string;
  year: number;
  price: number;
  description?: string;
  mileage: number;
  image_url?: string;
  images: string[];
  location?: string;
  fuel_type?: string;
  transmission?: string;
  engine_size?: string;
  horsepower?: number;
  color?: string;
  body_type?: string;
  brandId: string;
  categoryId?: string;
  userId: string;
  vin?: string;
  licensePlate?: string;
}
