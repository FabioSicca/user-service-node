import { UserAlreadyExistsError } from "../errors/user.errors.js";
import { hashPassword } from "../lib/password.js";
import type { UserRepository } from "./user.repository.js";
import type { CreateUserInput, PublicUser, LoginUserInput } from "../types/user.js";
import { NotFoundError } from "../errors/app.errors.js"
import { JwtService } from "../plugins/jwt.js";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

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

    return this.userRepository.toPublicUser(user);
  }

  async getAllUsers(): Promise<PublicUser[]> {
    const users = await this.userRepository.getAll();
    return users.map((user) => this.userRepository.toPublicUser(user));
  }

  async getUserById(id: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.userRepository.toPublicUser(user);
  }

  async getUserByEmail(email: string): Promise<PublicUser> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.userRepository.toPublicUser(user);
  }
  
  async deleteUserById(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.userRepository.deleteById(id);
  }
}
