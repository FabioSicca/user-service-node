import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

export class JwtService {
  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: "1h" });
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }

  private get secret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    return secret;
  }
  
}