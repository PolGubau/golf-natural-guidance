import { describe, expect, it } from "vitest";
import { InvalidCredentialsError } from "./auth-provider";
import { MOCK_ADMIN_CREDENTIALS, MockAuthProvider } from "./mock-auth-provider";

describe("MockAuthProvider", () => {
  it("authenticates Toni and verifies the signed session", async () => {
    const provider = new MockAuthProvider("test-secret");
    const session = await provider.signIn(MOCK_ADMIN_CREDENTIALS);

    expect(session.user).toMatchObject({
      name: "Toni Planells",
      role: "admin",
    });
    await expect(provider.verifySession(session.accessToken)).resolves.toEqual(
      session,
    );
  });

  it("rejects invalid credentials", async () => {
    const provider = new MockAuthProvider("test-secret");
    await expect(
      provider.signIn({
        email: MOCK_ADMIN_CREDENTIALS.email,
        password: "incorrecta",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("rejects tampered and expired sessions", async () => {
    let now = Date.UTC(2026, 7, 8);
    const provider = new MockAuthProvider("test-secret", () => now, 1_000);
    const session = await provider.signIn(MOCK_ADMIN_CREDENTIALS);

    await expect(
      provider.verifySession(`${session.accessToken}alterado`),
    ).resolves.toBeNull();
    now += 1_001;
    await expect(
      provider.verifySession(session.accessToken),
    ).resolves.toBeNull();
  });
});
