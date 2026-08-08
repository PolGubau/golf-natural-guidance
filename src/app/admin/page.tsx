import type { Metadata } from "next";
import { AdminSectionView } from "~/features/admin-dashboard/admin-section-view";

export const metadata: Metadata = { title: "Backoffice" };

export default function AdminPage() {
  return <AdminSectionView section="dashboard" />;
}
