"use client";

import {
  Bell,
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "~/components/brand";
import { Button } from "~/components/ui/button";
import { ErrorState, LoadingState } from "~/components/ui/states";
import type { AdminUser } from "~/infrastructure/auth/auth-provider";
import { useDemo } from "~/infrastructure/state/demo-store";
import { cn } from "~/lib/cn";
import { ActivitiesView } from "./views/activities-view";
import { AgendaView } from "./views/agenda-view";
import { BillingView } from "./views/billing-view";
import { BookingsView } from "./views/bookings-view";
import { ClientsView } from "./views/clients-view";
import { DashboardView } from "./views/dashboard-view";
import { SettingsView } from "./views/settings-view";
import { TeachersView } from "./views/teachers-view";

export type AdminSection =
  | "dashboard"
  | "bookings"
  | "agenda"
  | "clients"
  | "teachers"
  | "activities"
  | "billing"
  | "settings";
const navigation = [
  { id: "dashboard", label: "Resumen", icon: LayoutDashboard },
  { id: "bookings", label: "Reservas", icon: CalendarDays },
  { id: "agenda", label: "Agenda", icon: CalendarRange },
  { id: "clients", label: "Clientes", icon: UsersRound },
  { id: "teachers", label: "Profesores", icon: GraduationCap },
  { id: "activities", label: "Cursos y actividades", icon: CalendarRange },
  { id: "billing", label: "Facturación", icon: CircleDollarSign },
  { id: "settings", label: "Configuración", icon: Settings2 },
] as const;

export function AdminShell({
  user,
  logoutAction,
}: {
  user: AdminUser;
  logoutAction: () => Promise<void>;
}) {
  const { data, status, recovered } = useDemo();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  if (status === "loading" || !data)
    return <LoadingState label="Abriendo el backoffice" />;
  if (status === "error") return <ErrorState />;
  const current =
    navigation.find((item) => item.id === section) ?? navigation[0];
  return (
    <div className="min-h-dvh bg-[#efefeb] p-0 lg:p-4">
      <div className="mx-auto grid min-h-dvh max-w-[1500px] overflow-hidden bg-canvas shadow-[0_20px_80px_rgba(25,34,29,.08)] lg:min-h-[calc(100dvh-32px)] lg:grid-cols-[245px_minmax(0,1fr)] lg:rounded-[28px] lg:border lg:border-white">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-line bg-white p-4 transition-transform lg:static lg:w-auto lg:translate-x-0",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-14 items-center justify-between px-2">
            <Brand />
            <Button
              className="lg:hidden"
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar navegación"
            >
              <X />
            </Button>
          </div>
          <nav className="mt-6 grid gap-1" aria-label="Backoffice">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setSection(item.id);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition",
                    section === item.id
                      ? "bg-sand text-ink shadow-[inset_0_0_0_1px_rgba(24,35,29,.03)]"
                      : "text-muted hover:bg-sand/70 hover:text-ink",
                  )}
                >
                  <Icon
                    size={18}
                    strokeWidth={section === item.id ? 2.3 : 1.8}
                  />
                  {item.label}
                  {item.id === "billing" &&
                  data.compensationLines.some(
                    (line) => line.status === "pending",
                  ) ? (
                    <span className="ml-auto size-2 rounded-full bg-coral" />
                  ) : null}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl bg-forest p-4 text-white">
            <p className="text-xs text-white/55">Demo local</p>
            <p className="mt-1 text-sm font-semibold">
              Datos guardados en este navegador
            </p>
            <Link
              href="/booking"
              className="mt-4 inline-flex text-xs font-semibold text-coral hover:underline"
            >
              Abrir vista cliente →
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line p-3">
            <span className="grid size-9 place-items-center rounded-full bg-coral text-xs font-bold text-white">
              TP
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-xs">{user.name}</strong>
              <span className="block truncate text-[11px] text-muted">
                {user.email}
              </span>
            </span>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="px-2"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut size={15} />
              </Button>
            </form>
          </div>
        </aside>
        {menuOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-ink/20 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar navegación"
          />
        ) : null}
        <div className="min-w-0">
          <header className="flex h-[78px] items-center justify-between border-b border-line bg-white/65 px-4 backdrop-blur-xl sm:px-7">
            <div className="flex items-center gap-3">
              <Button
                className="lg:hidden"
                variant="secondary"
                size="sm"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir navegación"
              >
                <Menu />
              </Button>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">
                  Backoffice
                </p>
                <h1 className="text-xl font-semibold tracking-tight">
                  {current.label}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" aria-label="Notificaciones">
                <Bell size={18} />
                <span className="sr-only">Notificaciones</span>
              </Button>
              <Link
                href="/booking"
                className="hidden min-h-9 items-center rounded-lg border border-line bg-white px-3 text-xs font-semibold sm:inline-flex"
              >
                Nueva reserva
              </Link>
            </div>
          </header>
          <main className="max-h-[calc(100dvh-78px)] overflow-y-auto p-4 sm:p-7">
            {recovered ? (
              <div className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                Algunos datos locales se restauraron de forma segura.
              </div>
            ) : null}
            {section === "dashboard" ? (
              <DashboardView data={data} onNavigate={setSection} />
            ) : null}
            {section === "bookings" ? <BookingsView data={data} /> : null}
            {section === "agenda" ? <AgendaView data={data} /> : null}
            {section === "clients" ? <ClientsView data={data} /> : null}
            {section === "teachers" ? <TeachersView data={data} /> : null}
            {section === "activities" ? <ActivitiesView data={data} /> : null}
            {section === "billing" ? <BillingView data={data} /> : null}
            {section === "settings" ? <SettingsView data={data} /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
