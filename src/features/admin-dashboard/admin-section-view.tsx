"use client";

import { ErrorState, LoadingState } from "~/components/ui/states";
import { useDemo } from "~/infrastructure/state/demo-store";
import type { AdminSection } from "./admin-shell";
import { ActivitiesView } from "./views/activities-view";
import { AgendaView } from "./views/agenda-view";
import { AutomationsView } from "./views/automations-view";
import { BillingView } from "./views/billing-view";
import { BookingsView } from "./views/bookings-view";
import { ClientsView } from "./views/clients-view";
import { DashboardView } from "./views/dashboard-view";
import { LeadsView } from "./views/leads-view";
import { SettingsView } from "./views/settings-view";
import { TeachersView } from "./views/teachers-view";

export function AdminSectionView({
  section,
  clientId,
}: {
  section: AdminSection;
  clientId?: string;
}) {
  const { data, status, recovered } = useDemo();
  if (status === "loading" || !data)
    return <LoadingState label="Abriendo el backoffice" />;
  if (status === "error") return <ErrorState />;

  return (
    <>
      {recovered ? (
        <div className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Algunos datos se restauraron desde una copia segura.
        </div>
      ) : null}
      {section === "dashboard" ? <DashboardView data={data} /> : null}
      {section === "bookings" ? (
        <BookingsView data={data} clientId={clientId} />
      ) : null}
      {section === "agenda" ? <AgendaView data={data} /> : null}
      {section === "clients" ? <ClientsView data={data} /> : null}
      {section === "leads" ? <LeadsView data={data} /> : null}
      {section === "automations" ? <AutomationsView data={data} /> : null}
      {section === "teachers" ? <TeachersView data={data} /> : null}
      {section === "activities" ? <ActivitiesView data={data} /> : null}
      {section === "billing" ? <BillingView data={data} /> : null}
      {section === "settings" ? <SettingsView data={data} /> : null}
    </>
  );
}
