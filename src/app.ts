import Fastify from "fastify";
import { User } from "./types/user.js";
import type { CreateUserInput } from "./types/user.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get("/", async () => {
    return {
      message: "User Service",
    };
  });

  app.post<{ Body: CreateUserInput }>("/users", async (request, reply) => {
    const { email, password } = request.body;

    return reply.status(201).send({
      message: "User created",
      data: {
        email,
        password,
      },
    });
  });

  return app;
}