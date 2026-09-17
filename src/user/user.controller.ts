import type { UserService } from "./user.service.js";
import type { CreateUserInput } from "../types/user.js";
import type { Request, Response } from "express";

export interface UserParams {
  id: string;
}

export interface EmailParams {
  email: string;
}

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

    async getAllUsers(req: Request, res: Response) {
      const users = await this.userService.getAllUsers();
  
      return res.status(200).json(users);
    }

    async getById(req: Request<UserParams>, res: Response) {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
  
      return res.status(200).json(user);
    }

    async getByEmail(req: Request<EmailParams>, res: Response) {
      const { email } = req.params;
      const user = await this.userService.getUserByEmail(email);
  
      return res.status(200).json(user);
    }

    async deleteUserById(req: Request<UserParams>, res: Response) {
      const { id } = req.params;
      await this.userService.deleteUserById(id);
  
      return res.status(204).send();
    }
}
