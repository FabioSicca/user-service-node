import type { Express, NextFunction } from "express";
import { AppError } from "../errors/app.errors.js";
import type { Request, Response } from "express";

export function setAppErrorHandler(app: Express) {
  app.use(
    (
      error: Error,
      request: Request,
      reply: Response,
      next: NextFunction,
    ) => {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).json({
          statusCode: error.statusCode,
          error: error.name,
          message: error.message,
        });
      }

      console.error(error);

      return reply.status(500).json({
        statusCode: 500,
        error: "Internal Server Error",
        message: "Unexpected error",
      });
    },
  );
}