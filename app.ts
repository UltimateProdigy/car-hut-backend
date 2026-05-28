import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "./instrument";
import { Request, Response } from "express";
import { errorHandler } from "./middleware/errorHandler";
import { imageRoutes } from "./routes/image.routes";
import { carRoutes } from "./routes/car.routes";
import { bidRoutes } from "./routes/bid.routes";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { staffRoutes } from "./routes/staff.routes";
import { cacheRoutes } from "./routes/cache.routes";
import logger from "./config/logger";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/v1/images", imageRoutes);
app.use("/v1/cars", carRoutes);
app.use("/v1/bids", bidRoutes);
app.use("/v1/auth", authRoutes);
app.use("/v1/users", userRoutes);
app.use("/v1/staffs", staffRoutes);
app.use("/v1/cache", cacheRoutes);
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use(/.*/, (req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;
