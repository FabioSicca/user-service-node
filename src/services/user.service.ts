import { UserAlreadyExistsError } from "../errors/user.errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { toPublicUser } from "../mappers/user.mapper.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { CreateUserInput, PublicUser, LoginUserInput } from "../types/user.js";
import { NotFoundError, UnauthorizedError } from "../errors/app.errors.js"

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

    return toPublicUser(user);
  }

  async loginUser(input: LoginUserInput): Promise<PublicUser> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new NotFoundError("User not found");
    }
    const isPasswordValid = await this.verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid password");
    }

    return toPublicUser(user);
  }

  private async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return await verifyPassword(password, passwordHash);
  }

}
