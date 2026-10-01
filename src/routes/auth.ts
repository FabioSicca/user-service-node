import { Router } from "express";
import type { Request, Response } from "express";

import { UserRepository } from "../user/user.repository.js";
import { JwtService } from "../plugins/jwt.js";
import { AuthService } from "../auth/auth.service.js";
import { AuthController } from "../auth/auth.controller.js";
import { OAuthService } from "../auth/oauth.service.js";
import { OAuthRepository } from "../auth/oauth.repository.js";

const router = Router();
const userRepository = new UserRepository();
const jwtService = new JwtService();
const authService = new AuthService(userRepository, jwtService);
const oauthService = new OAuthService(
  userRepository,
  new OAuthRepository(),
  jwtService,
);
const authController = new AuthController(authService, oauthService);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
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
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/auth/login", (req: Request, res: Response) =>
  authController.login(req, res),
);

/**
 * @openapi
 * /auth/google:
 *   get:
 *     summary: Start Google OAuth login
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects to Google
 */
router.get("/auth/google", (req: Request, res: Response) =>
  authController.startGoogle(req, res),
);

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid OAuth callback
 */
router.get("/auth/google/callback", (req: Request, res: Response) =>
  authController.googleCallback(req, res),
);

/**
 * @openapi
 * /auth/github:
 *   get:
 *     summary: Start GitHub OAuth login
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects to GitHub
 */
router.get("/auth/github", (req: Request, res: Response) =>
  authController.startGitHub(req, res),
);

/**
 * @openapi
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid OAuth callback
 */
router.get("/auth/github/callback", (req: Request, res: Response) =>
  authController.githubCallback(req, res),
);

export default router;
