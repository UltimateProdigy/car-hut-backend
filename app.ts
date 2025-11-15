import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "./instrument";
import { Request, Response } from "express";
import { errorHandler } from "./middleware/errorHandler";
import { imageRoutes } from "./routes/imageRoutes";
import { carRoutes } from "./routes/carRoutes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/v1/image", imageRoutes);
app.use("/v1/car", carRoutes);
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use(/.*/, (req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;
