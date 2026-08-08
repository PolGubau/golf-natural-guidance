import type { Metadata } from "next";
import { loginAction, logoutAction } from "~/app/admin/actions";
import { LoginView } from "~/features/admin-auth/login-view";
import { AdminShell } from "~/features/admin-dashboard/admin-shell";
import { getAdminSession } from "~/infrastructure/auth/admin-session";

export const metadata: Metadata = { title: "Backoffice" };

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) return <LoginView action={loginAction} />;
  return <AdminShell user={session.user} logoutAction={logoutAction} />;
}
