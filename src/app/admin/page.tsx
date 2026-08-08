import type { Metadata } from "next";
import { AdminShell } from "~/features/admin-dashboard/admin-shell";

export const metadata: Metadata = { title: "Backoffice" };

export default function AdminPage() {
  return <AdminShell />;
}
