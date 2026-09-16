import { Router } from "express";
import type { Request, Response } from "express";

import { UserController } from "../controllers/user.controller.js";
import { UserService } from "../services/user.service.js";
import { InMemoryUserRepository } from "../repositories/user.repository.js";

const router = Router();
const userRepository = new InMemoryUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User created successfully
*/
router.post("/users", (req: Request, res: Response) => userController.create(req, res));

/** 
 * @openapi
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *        description: Invalid credentials
 *       404:
 *        description: User not found
 *       
 */
router.post("/users/login", (req: Request, res: Response) => userController.login(req, res));

export default router;