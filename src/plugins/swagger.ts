import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const swaggerSpec = swaggerJsDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Service API",
      description: "User management and authentication API",
      version: "1.0.0",
    },
    components: {
      schemas: {
        PublicUser: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            email: {
              type: "string",
              format: "email",
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
          required: ["id", "email", "role", "createdAt"],
        },
        CreateUser: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
              format: "password",
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN"],
            },
          },
          required: ["email", "password"],
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
});

export function swaggerPlugin(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}