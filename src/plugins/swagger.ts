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
  },
  apis: ["./src/routes/*.ts",
        "./dist/routes/*.js",
  ],
});

export function swaggerPlugin(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}