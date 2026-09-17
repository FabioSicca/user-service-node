export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface LoginResponse {
  user: PublicUser;
  token: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
}

export interface CreateUserRecord {
  email: string;
  passwordHash: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}