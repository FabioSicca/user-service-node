import { Router } from "express";

const router = Router();

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
router.post("/users", (req, res) => {
  const { email, password } = req.body;

  res.status(201).json({
    message: "User created",
    data: {
      email,
      password,
    },
  });
});

export default router;