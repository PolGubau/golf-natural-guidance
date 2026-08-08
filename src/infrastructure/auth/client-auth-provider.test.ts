/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import {
  LocalClientAuthProvider,
  MOCK_GOOGLE_CLIENT,
} from "./client-auth-provider";

describe("LocalClientAuthProvider", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists and restores the simulated Google session", async () => {
    const provider = new LocalClientAuthProvider();

    await expect(provider.signInWithGoogle()).resolves.toEqual({
      user: MOCK_GOOGLE_CLIENT,
    });
    await expect(provider.restoreSession()).resolves.toEqual({
      user: MOCK_GOOGLE_CLIENT,
    });
  });

  it("clears the client session on sign out", async () => {
    const provider = new LocalClientAuthProvider();
    await provider.signInWithGoogle();
    await provider.signOut();

    await expect(provider.restoreSession()).resolves.toBeNull();
  });
});
