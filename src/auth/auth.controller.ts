import type { Request, Response } from "express";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response) {
    const user = await this.authService.loginUser(req.body);

    return res.status(200).json(user);
  }
}