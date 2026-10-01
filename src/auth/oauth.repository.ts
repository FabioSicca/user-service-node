import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { oauthAccounts } from "../db/schema.js";
import type {
  CreateOAuthAccountRecord,
  OAuthAccount,
  OAuthProvider,
} from "../types/user.js";

export class OAuthRepository {
  async findByProviderUser(
    provider: OAuthProvider,
    providerUserId: string,
  ): Promise<OAuthAccount | null> {
    const [account] = await db
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, provider),
          eq(oauthAccounts.providerUserId, providerUserId),
        ),
      )
      .limit(1);

    return account ? this.toAccount(account) : null;
  }

  async create(data: CreateOAuthAccountRecord): Promise<OAuthAccount> {
    const [account] = await db
      .insert(oauthAccounts)
      .values({
        userId: data.userId,
        provider: data.provider,
        providerUserId: data.providerUserId,
      })
      .returning();

    return this.toAccount(account);
  }

  private toAccount(account: typeof oauthAccounts.$inferSelect): OAuthAccount {
    return {
      ...account,
      provider: account.provider as OAuthProvider,
    };
  }
}
