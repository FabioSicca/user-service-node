export const createUserBodySchema = {
  $id: "CreateUserInput",
  type: "object",
  additionalProperties: false,
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
      description: "Unique email address used to sign in",
    },
    password: {
      type: "string",
      minLength: 8,
      maxLength: 128,
      writeOnly: true,
      description: "Plain-text password; stored only as a hash",
    },
  },
} as const;

export const publicUserSchema = {
  $id: "PublicUser",
  type: "object",
  additionalProperties: false,
  required: ["id", "email", "role", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: ["USER", "ADMIN"] },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;


export const loginUserBodySchema = {
  $id: "LoginUserInput",
  type: "object",
  additionalProperties: false,
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8, maxLength: 128, writeOnly: true },
  },
} as const;