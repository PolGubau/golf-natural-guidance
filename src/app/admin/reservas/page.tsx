import { AdminSectionView } from "~/features/admin-dashboard/admin-section-view";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string | string[] }>;
}) {
  const { cliente } = await searchParams;
  return (
    <AdminSectionView
      section="bookings"
      clientId={typeof cliente === "string" ? cliente : undefined}
    />
  );
}
