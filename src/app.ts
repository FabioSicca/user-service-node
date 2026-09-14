import express from "express";
import { swaggerPlugin } from "./plugins/swagger.js";
import userRoutes from "./routes/users.js";

export function buildApp() {
  const app = express();

  app.use(express.json());

  swaggerPlugin(app);

  app.use(userRoutes);

  return app;
}