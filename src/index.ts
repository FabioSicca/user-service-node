import { buildApp } from "./app.js";

const app = buildApp();

app.listen(3000, "localhost", () => {
  console.log("Server running on http://localhost:3000");
});