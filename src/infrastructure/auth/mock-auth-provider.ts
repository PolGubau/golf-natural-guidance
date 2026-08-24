import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  AdminUser,
  AuthCredentials,
  AuthProvider,
  AuthSession,
} from "./auth-provider";
import { InvalidCredentialsError } from "./auth-provider";

export const MOCK_ADMIN_CREDENTIALS = {
  email: "demo@academia-demo.example",
  password: "Demo-Academia-2026!",
} as const;

const DEMO_PROFILE: AdminUser = {
  id: "admin-demo",
  name: "Administrador Demo",
  email: MOCK_ADMIN_CREDENTIALS.email,
  role: "admin",
};

type TokenPayload = { sub: string; role: "admin"; exp: number };

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export class MockAuthProvider implements AuthProvider {
  constructor(
    private readonly secret: string,
    private readonly now: () => number = Date.now,
    private readonly sessionDurationMs = 8 * 60 * 60 * 1000,
  ) {}

  async signIn(credentials: AuthCredentials): Promise<AuthSession> {
    const validEmail = constantTimeEqual(
      credentials.email.trim().toLowerCase(),
      MOCK_ADMIN_CREDENTIALS.email,
    );
    const validPassword = constantTimeEqual(
      credentials.password,
      MOCK_ADMIN_CREDENTIALS.password,
    );
    if (!validEmail || !validPassword) throw new InvalidCredentialsError();

    const expiresAt = new Date(this.now() + this.sessionDurationMs);
    const payload: TokenPayload = {
      sub: DEMO_PROFILE.id,
      role: DEMO_PROFILE.role,
      exp: expiresAt.getTime(),
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      "base64url",
    );
    return {
      accessToken: `${encodedPayload}.${this.sign(encodedPayload)}`,
      expiresAt,
      user: DEMO_PROFILE,
    };
  }

  async verifySession(accessToken?: string): Promise<AuthSession | null> {
    if (!accessToken) return null;
    const [encodedPayload, signature, ...rest] = accessToken.split(".");
    if (!encodedPayload || !signature || rest.length > 0) return null;
    if (!constantTimeEqual(signature, this.sign(encodedPayload))) return null;

    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, "base64url").toString(),
      ) as TokenPayload;
      if (
        payload.sub !== DEMO_PROFILE.id ||
        payload.role !== "admin" ||
        payload.exp <= this.now()
      )
        return null;
      return {
        accessToken,
        expiresAt: new Date(payload.exp),
        user: DEMO_PROFILE,
      };
    } catch {
      return null;
    }
  }

  async signOut(_accessToken?: string): Promise<void> {}

  private sign(value: string) {
    return createHmac("sha256", this.secret).update(value).digest("base64url");
  }
}
