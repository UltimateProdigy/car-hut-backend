import dotenv from "dotenv";

dotenv.config();
import "./instrument";
import * as Sentry from "@sentry/node";
import app from "./app";

Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔍 Sentry DSN configured: ${!!process.env.SENTRY_DSN}`);
});