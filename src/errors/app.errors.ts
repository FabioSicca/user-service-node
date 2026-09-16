import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
      this.name = "AppError";
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
      super(message, StatusCodes.NOT_FOUND);
      this.name = "NotFoundError";
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
      super(message, StatusCodes.UNAUTHORIZED);
      this.name = "UnauthorizedError";
    }
}