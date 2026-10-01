export type Role = "USER" | "ADMIN";

export type OAuthProvider = "google" | "github";

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
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
  passwordHash?: string | null;
}

export interface OAuthAccount {
  id: string;
  userId: string;
  provider: OAuthProvider;
  providerUserId: string;
  createdAt: Date;
}

export interface CreateOAuthAccountRecord {
  userId: string;
  provider: OAuthProvider;
  providerUserId: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}