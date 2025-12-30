import { Role } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
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
  images?: string[];
  location?: string;
  fuel_type?: string;
  transmission?: string;
  engine_size?: string;
  horsepower?: number;
  color?: string;
  body_type?: string;
  brand_id: string;
  category_id?: string | null;
  user_id: string;
  vin?: string;
  licensePlate?: string;
  is_active?: boolean;
  is_featured?: boolean;
  status?: string;
  auction_start_date?: Date;
  auction_end_date?: Date;
  reserve_price?: number;
  buy_now_price?: number;
  current_bid?: number;
}
