import { randomUUID } from "node:crypto";
import type { CreateUserRecord, User } from "../types/user.js";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserRecord): Promise<User>;
}

export class InMemoryUserRepository implements UserRepository {
  private readonly usersById = new Map<string, User>();
  private readonly userIdsByEmail = new Map<string, string>();

  async findByEmail(email: string): Promise<User | null> {
    const id = this.userIdsByEmail.get(email.toLowerCase());
    if (!id) {
      return null;
    }

    return this.usersById.get(id) ?? null;
  }

  async create(data: CreateUserRecord): Promise<User> {
    const user: User = {
      id: randomUUID(),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: "USER",
      createdAt: new Date(),
    };

    this.usersById.set(user.id, user);
    this.userIdsByEmail.set(user.email, user.id);

    return user;
  }
}
