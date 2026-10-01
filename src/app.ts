import express from "express";
import cookieParser from "cookie-parser";
import { swaggerPlugin } from "./plugins/swagger.js";
import { setAppErrorHandler } from "./plugins/error-handler.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";

export function buildApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser(process.env.COOKIE_SECRET));

  swaggerPlugin(app);

  app.use(authRoutes);
  app.use(userRoutes);
  setAppErrorHandler(app);

  return app;
}