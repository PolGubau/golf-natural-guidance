import "server-only";

import { cookies } from "next/headers";
import type { AuthCredentials } from "./auth-provider";
import { MockAuthProvider } from "./mock-auth-provider";

const COOKIE_NAME = "gng-admin-session";
const provider = new MockAuthProvider(
  process.env.GNG_AUTH_SECRET ?? "gng-local-demo-auth-secret-v1",
);

export async function createAdminSession(credentials: AuthCredentials) {
  const session = await provider.signIn(credentials);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: session.expiresAt,
  });
  return session;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return provider.verifySession(cookieStore.get(COOKIE_NAME)?.value);
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAME)?.value;
  await provider.signOut(accessToken);
  cookieStore.delete(COOKIE_NAME);
}
