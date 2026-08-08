import { loginAction, logoutAction } from "~/app/admin/actions";
import { LoginView } from "~/features/admin-auth/login-view";
import { AdminShell } from "~/features/admin-dashboard/admin-shell";
import { getAdminSession } from "~/infrastructure/auth/admin-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) return <LoginView action={loginAction} />;
  return (
    <AdminShell user={session.user} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  );
}
