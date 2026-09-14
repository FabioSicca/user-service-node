import type { Express } from "express";
import { UserAlreadyExistsError } from "../errors/user.errors.js";
import type { Request, Response } from "express";

export function setAppErrorHandler(app: Express) {
  app.use((error: Error, request: Request, reply: Response) => {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({
        statusCode: 409,
        error: "Conflict",
        message: error.message,
      });
    }

    return reply.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Unexpected error",
    });
  });
}
