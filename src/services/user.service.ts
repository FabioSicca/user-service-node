import { UserAlreadyExistsError } from "../errors/user.errors.js";
import { hashPassword } from "../lib/password.js";
import { toPublicUser } from "../mappers/user.mapper.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { CreateUserInput, PublicUser } from "../types/user.js";

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
}
