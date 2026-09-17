import { UserAlreadyExistsError } from "../errors/user.errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { CreateUserInput, PublicUser, LoginUserInput } from "../types/user.js";
import { NotFoundError, UnauthorizedError } from "../errors/app.errors.js"
import { User } from "../types/user.js";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(input: CreateUserInput): Promise<PublicUser> {
    const email = input.email.toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    const user = await this.userRepository.create({
      email,
      passwordHash: await hashPassword(input.password),
    });

    return this.toPublicUser(user);
  }

  async loginUser(input: LoginUserInput): Promise<PublicUser> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new NotFoundError("User not found");
    }
    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid password");
    }

    return this.toPublicUser(user);
  }

  async getAllUsers(): Promise<PublicUser[]> {
    const users = await this.userRepository.getAll();
    return users.map((user) => this.toPublicUser(user));
  }

  async getUserById(id: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.toPublicUser(user);
  }

  async getUserByEmail(email: string): Promise<PublicUser> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.toPublicUser(user);
  }
  
  async deleteUserById(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.userRepository.deleteById(id);
  }

  toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    };
  }
}
