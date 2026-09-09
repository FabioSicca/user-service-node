type Role = "USER" | "ADMIN";

export type PublicUser = Omit<User, "passwordHash">;

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
}