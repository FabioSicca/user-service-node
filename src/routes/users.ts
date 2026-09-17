import { Router } from "express";
import type { Request, Response } from "express";

import { UserController } from "../user/user.controller.js";
import { UserService } from "../user/user.service.js";
import { UserRepository } from "../user/user.repository.js";
import {EmailParams, UserParams} from "../user/user.controller.js";

const router = Router();
const userRepository = new UserRepository();
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

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Users found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PublicUser'
 */
router.get("/users", (req: Request, res: Response) => userController.getAllUsers(req, res));

/**
 * @openapi
 * /users/email/{email}:
 *   get:
 *     summary: Get a user by email
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: The email of the user to retrieve
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUser'
 *       404:
 *         description: User not found
 */
router.get("/users/email/:email", (req: Request<EmailParams>, res: Response) => userController.getByEmail(req, res));

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUser'
 *       404:
 *         description: User not found
 */
router.get("/users/:id", (req: Request<UserParams>, res: Response) => userController.getById(req, res));

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", (req: Request<UserParams>, res: Response) => userController.deleteUserById(req, res));

export default router;