import type { RequestHandler } from "express";
import { UnauthorizedError } from "../errors/app.errors.js";
import { JwtService } from "./jwt.js";
import type { Request, Response, NextFunction } from "express";
import type { UserParams } from "../user/user.controller.js";
const jwtService = new JwtService();

export const authenticate: RequestHandler<any> = (request, _response, next) => {
  const authorization = request.header("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return next(new UnauthorizedError("Missing or invalid Authorization header"));
  }

  try {
    request.user = jwtService.verify(token);
    return next();
  } catch {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
};

export function requireSelfOrAdmin(
  req: Request<UserParams>,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const isOwner = req.user.userId === req.params.id;
  const isAdmin = req.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  next();
}