import type { UserService } from "../services/user.service.js";
import type { CreateUserInput } from "../types/user.js";
import type { Request, Response } from "express";

export class UserController {
    constructor(private readonly userService: UserService) {}
  
    async create(req: Request, res: Response) {
      const user = await this.userService.createUser(req.body);
  
      return res.status(201).json(user);
    }
  
    async login(req: Request, res: Response) {
      const user = await this.userService.loginUser(req.body);
  
      return res.status(200).json(user);
    }
  }