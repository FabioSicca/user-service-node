import { buildApp } from "./app.js";

const app = buildApp();

try {
  await app.listen({
    port: 3000,
    host: "localhost",
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}