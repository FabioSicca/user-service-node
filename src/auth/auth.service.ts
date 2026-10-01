import { UserRepository } from "../user/user.repository.js";
import { JwtService } from "../plugins/jwt.js";
import type { LoginUserInput, LoginResponse } from "../types/user.js";
import { NotFoundError, UnauthorizedError } from "../errors/app.errors.js";
import { verifyPassword } from "../lib/password.js";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(input: LoginUserInput): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError("Password login is not available for this account");
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid password");
    }

    return {
      user: this.userRepository.toPublicUser(user),
      token: this.jwtService.sign({ userId: user.id, role: user.role }),
    };
  }
}
