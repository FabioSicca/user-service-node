import type { UserService } from "../services/user.service.js";
import type { CreateUserInput } from "../types/user.js";
import type { Request, Response } from "express";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(
    request: Request<{ Body: CreateUserInput }>,
    reply: Response,
  ) {
    const user = await this.userService.createUser(request.body as CreateUserInput);

    return reply.status(201).json(user);
  }
}
