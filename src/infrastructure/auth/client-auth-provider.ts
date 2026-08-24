export type ClientUser = {
  id: string;
  name: string;
  email: string;
  provider: "google";
};

export type ClientSession = { user: ClientUser };

export interface ClientAuthProvider {
  restoreSession(): Promise<ClientSession | null>;
  signInWithGoogle(): Promise<ClientSession>;
  signOut(): Promise<void>;
}

const STORAGE_KEY = "demo-client-session-v1";

export const MOCK_GOOGLE_CLIENT: ClientUser = {
  id: "google-lucia",
  name: "Lucía Martín",
  email: "lucia@example.com",
  provider: "google",
};

export class LocalClientAuthProvider implements ClientAuthProvider {
  async restoreSession(): Promise<ClientSession | null> {
    if (typeof window === "undefined") return null;
    try {
      const value = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? "null",
      ) as ClientSession | null;
      return value?.user?.id && value.user.email ? value : null;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  async signInWithGoogle(): Promise<ClientSession> {
    const session = { user: MOCK_GOOGLE_CLIENT };
    if (typeof window !== "undefined")
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  async signOut() {
    if (typeof window !== "undefined")
      window.localStorage.removeItem(STORAGE_KEY);
  }
}
