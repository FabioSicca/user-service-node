import express from "express";
import { swaggerPlugin } from "./plugins/swagger.js";
import { setAppErrorHandler } from "./plugins/error-handler.js";
import userRoutes from "./routes/users.js";

export function buildApp() {
  const app = express();

  app.use(express.json());

  swaggerPlugin(app);

  app.use(userRoutes);
  setAppErrorHandler(app);

  return app;
}