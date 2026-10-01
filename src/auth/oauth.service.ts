import {
  GitHub,
  Google,
  OAuth2RequestError,
  generateCodeVerifier,
  generateState,
} from "arctic";
import { JwtService } from "../plugins/jwt.js";
import { UserRepository } from "../user/user.repository.js";
import { OAuthRepository } from "./oauth.repository.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../errors/app.errors.js";
import type { LoginResponse, OAuthProvider, User } from "../types/user.js";

const OAUTH_COOKIE_NAME = "oauth_flow";
const OAUTH_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

export interface OAuthFlowCookie {
  state: string;
  provider: OAuthProvider;
  codeVerifier?: string;
}

export class OAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly oauthRepository: OAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  get cookieName(): string {
    return OAUTH_COOKIE_NAME;
  }

  get cookieMaxAgeMs(): number {
    return OAUTH_COOKIE_MAX_AGE_MS;
  }

  createGoogleAuthorization(): { url: URL; flow: OAuthFlowCookie } {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = this.google().createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email",
      "profile",
    ]);

    return {
      url,
      flow: { state, provider: "google", codeVerifier },
    };
  }

  createGitHubAuthorization(): { url: URL; flow: OAuthFlowCookie } {
    const state = generateState();
    const url = this.github().createAuthorizationURL(state, [
      "read:user",
      "user:email",
    ]);

    return {
      url,
      flow: { state, provider: "github" },
    };
  }

  parseFlowCookie(value: unknown): OAuthFlowCookie | null {
    if (!value || typeof value !== "string") {
      return null;
    }

    try {
      const parsed = JSON.parse(value) as OAuthFlowCookie;
      if (
        typeof parsed.state !== "string" ||
        (parsed.provider !== "google" && parsed.provider !== "github")
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  async completeGoogleLogin(
    code: string,
    state: string,
    flow: OAuthFlowCookie,
  ): Promise<LoginResponse> {
    this.assertCallback(code, state, flow, "google");

    if (!flow.codeVerifier) {
      throw new BadRequestError("Missing PKCE verifier for Google login");
    }

    try {
      const tokens = await this.google().validateAuthorizationCode(
        code,
        flow.codeVerifier,
      );
      const profile = await this.fetchGoogleProfile(tokens.accessToken());
      return this.loginFromOAuth("google", profile.id, profile.email);
    } catch (error) {
      this.rethrowOAuthError(error);
    }
  }

  async completeGitHubLogin(
    code: string,
    state: string,
    flow: OAuthFlowCookie,
  ): Promise<LoginResponse> {
    this.assertCallback(code, state, flow, "github");

    try {
      const tokens = await this.github().validateAuthorizationCode(code);
      const profile = await this.fetchGitHubProfile(tokens.accessToken());
      return this.loginFromOAuth("github", profile.id, profile.email);
    } catch (error) {
      this.rethrowOAuthError(error);
    }
  }

  private assertCallback(
    code: string,
    state: string,
    flow: OAuthFlowCookie,
    provider: OAuthProvider,
  ): void {
    if (!code || !state) {
      throw new BadRequestError("Missing OAuth code or state");
    }

    if (flow.provider !== provider || flow.state !== state) {
      throw new BadRequestError("Invalid OAuth state");
    }
  }

  private async loginFromOAuth(
    provider: OAuthProvider,
    providerUserId: string,
    email: string,
  ): Promise<LoginResponse> {
    const user = await this.findOrCreateUser(provider, providerUserId, email);

    return {
      user: this.userRepository.toPublicUser(user),
      token: this.jwtService.sign({ userId: user.id, role: user.role }),
    };
  }

  private async findOrCreateUser(
    provider: OAuthProvider,
    providerUserId: string,
    email: string,
  ): Promise<User> {
    const existingAccount = await this.oauthRepository.findByProviderUser(
      provider,
      providerUserId,
    );

    if (existingAccount) {
      const user = await this.userRepository.findById(existingAccount.userId);
      if (!user) {
        throw new UnauthorizedError("OAuth account is not linked to a user");
      }
      return user;
    }

    const normalizedEmail = email.toLowerCase();
    let user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      user = await this.userRepository.create({
        email: normalizedEmail,
        passwordHash: null,
      });
    }

    await this.oauthRepository.create({
      userId: user.id,
      provider,
      providerUserId,
    });

    return user;
  }

  private async fetchGoogleProfile(
    accessToken: string,
  ): Promise<{ id: string; email: string }> {
    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedError("Failed to fetch Google profile");
    }

    const profile = (await response.json()) as {
      sub?: string;
      email?: string;
    };

    if (!profile.sub) {
      throw new UnauthorizedError("Google profile is missing user id");
    }

    if (!profile.email) {
      throw new BadRequestError(
        "Google did not provide an email. Ensure the email scope is granted.",
      );
    }

    return { id: profile.sub, email: profile.email };
  }

  private async fetchGitHubProfile(
    accessToken: string,
  ): Promise<{ id: string; email: string }> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "user-service-node",
    };

    const userResponse = await fetch("https://api.github.com/user", { headers });

    if (!userResponse.ok) {
      throw new UnauthorizedError("Failed to fetch GitHub profile");
    }

    const githubUser = (await userResponse.json()) as {
      id?: number;
      email?: string | null;
    };

    if (githubUser.id == null) {
      throw new UnauthorizedError("GitHub profile is missing user id");
    }

    const email =
      githubUser.email ?? (await this.fetchGitHubPrimaryEmail(headers));

    if (!email) {
      throw new BadRequestError(
        "GitHub did not provide an email. Ensure the user:email scope is granted.",
      );
    }

    return { id: String(githubUser.id), email };
  }

  private async fetchGitHubPrimaryEmail(
    headers: Record<string, string>,
  ): Promise<string | null> {
    const response = await fetch("https://api.github.com/user/emails", {
      headers,
    });

    if (!response.ok) {
      return null;
    }

    const emails = (await response.json()) as Array<{
      email?: string;
      primary?: boolean;
      verified?: boolean;
    }>;

    const primary = emails.find((item) => item.primary && item.verified);
    return primary?.email ?? emails.find((item) => item.verified)?.email ?? null;
  }

  private google(): Google {
    return new Google(
      requireEnv("GOOGLE_CLIENT_ID"),
      requireEnv("GOOGLE_CLIENT_SECRET"),
      `${requireEnv("OAUTH_BASE_URL")}/auth/google/callback`,
    );
  }

  private github(): GitHub {
    return new GitHub(
      requireEnv("GITHUB_CLIENT_ID"),
      requireEnv("GITHUB_CLIENT_SECRET"),
      `${requireEnv("OAUTH_BASE_URL")}/auth/github/callback`,
    );
  }

  private rethrowOAuthError(error: unknown): never {
    if (error instanceof OAuth2RequestError) {
      throw new UnauthorizedError("Invalid or expired OAuth authorization code");
    }
    throw error;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}
