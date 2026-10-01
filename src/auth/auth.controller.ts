import type { CookieOptions, Request, Response } from "express";
import type { AuthService } from "./auth.service.js";
import type { OAuthService } from "./oauth.service.js";
import { BadRequestError } from "../errors/app.errors.js";

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
  ) {}

  async login(req: Request, res: Response) {
    const user = await this.authService.loginUser(req.body);

    return res.status(200).json(user);
  }

  startGoogle(_req: Request, res: Response) {
    const { url, flow } = this.oauthService.createGoogleAuthorization();
    this.setOAuthCookie(res, flow);
    return res.redirect(url.toString());
  }

  async googleCallback(req: Request, res: Response) {
    const flow = this.readOAuthCookie(req);
    this.clearOAuthCookie(res);

    if (typeof req.query.error === "string") {
      throw new BadRequestError(req.query.error);
    }

    const result = await this.oauthService.completeGoogleLogin(
      queryString(req.query.code),
      queryString(req.query.state),
      flow,
    );

    return res.status(200).json(result);
  }

  startGitHub(_req: Request, res: Response) {
    const { url, flow } = this.oauthService.createGitHubAuthorization();
    this.setOAuthCookie(res, flow);
    return res.redirect(url.toString());
  }

  async githubCallback(req: Request, res: Response) {
    const flow = this.readOAuthCookie(req);
    this.clearOAuthCookie(res);

    if (typeof req.query.error === "string") {
      throw new BadRequestError(req.query.error);
    }

    const result = await this.oauthService.completeGitHubLogin(
      queryString(req.query.code),
      queryString(req.query.state),
      flow,
    );

    return res.status(200).json(result);
  }

  private oauthCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge: this.oauthService.cookieMaxAgeMs,
      path: "/",
    };
  }

  private setOAuthCookie(
    res: Response,
    flow: ReturnType<OAuthService["createGoogleAuthorization"]>["flow"],
  ) {
    const secret = process.env.COOKIE_SECRET;
    if (!secret) {
      throw new Error("COOKIE_SECRET is not configured");
    }

    res.cookie(
      this.oauthService.cookieName,
      JSON.stringify(flow),
      this.oauthCookieOptions(),
    );
  }

  private readOAuthCookie(req: Request) {
    const flow = this.oauthService.parseFlowCookie(
      req.signedCookies[this.oauthService.cookieName],
    );

    if (!flow) {
      throw new BadRequestError("Missing or invalid OAuth state cookie");
    }

    return flow;
  }

  private clearOAuthCookie(res: Response) {
    res.clearCookie(this.oauthService.cookieName, { path: "/" });
  }
}

function queryString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
