import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import type { CreateUserRecord, User } from "../types/user.js";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return user ? this.toUser(user) : null;
  }

  async create(data: CreateUserRecord): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
      })
      .returning();

    return this.toUser(user);
  }

  private toUser(user: typeof users.$inferSelect): User {
    return {
      ...user,
      role: user.role as User["role"],
    };
  }

  async getAll(): Promise<User[]> {
    const usersList = await db.select().from(users);
    return usersList.map((user) => this.toUser(user));
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ? this.toUser(user) : null;
  }

  async deleteById(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}
