export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin";
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthSession = {
  accessToken: string;
  expiresAt: Date;
  user: AdminUser;
};

export interface AuthProvider {
  signIn(credentials: AuthCredentials): Promise<AuthSession>;
  verifySession(accessToken?: string): Promise<AuthSession | null>;
  signOut(accessToken?: string): Promise<void>;
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}
