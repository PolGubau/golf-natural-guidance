"use client";

import {
  BellIcon as Bell,
  CalendarDotsIcon as CalendarDays,
  CalendarBlankIcon as CalendarRange,
  CurrencyCircleDollarIcon as CircleDollarSign,
  GraduationCapIcon as GraduationCap,
  SquaresFourIcon as LayoutDashboard,
  SignOutIcon as LogOut,
  ListIcon as Menu,
  SlidersHorizontalIcon as Settings2,
  UsersThreeIcon as UsersRound,
  XIcon as X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Brand } from "~/components/brand";
import { Button } from "~/components/ui/button";
import type { AdminUser } from "~/infrastructure/auth/auth-provider";
import { useDemo } from "~/infrastructure/state/demo-store";
import { cn } from "~/lib/cn";

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
  { id: "dashboard", label: "Resumen", href: "/admin", icon: LayoutDashboard },
  {
    id: "bookings",
    label: "Reservas",
    href: "/admin/reservas",
    icon: CalendarDays,
  },
  { id: "agenda", label: "Agenda", href: "/admin/agenda", icon: CalendarRange },
  {
    id: "clients",
    label: "Clientes",
    href: "/admin/clientes",
    icon: UsersRound,
  },
  {
    id: "teachers",
    label: "Profesores",
    href: "/admin/profesores",
    icon: GraduationCap,
  },
  {
    id: "activities",
    label: "Cursos y actividades",
    href: "/admin/actividades",
    icon: CalendarRange,
  },
  {
    id: "billing",
    label: "Facturación",
    href: "/admin/facturacion",
    icon: CircleDollarSign,
  },
  {
    id: "settings",
    label: "Configuración",
    href: "/admin/configuracion",
    icon: Settings2,
  },
] as const;

export function AdminShell({
  user,
  logoutAction,
  children,
}: {
  user: AdminUser;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const { data } = useDemo();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const current =
    navigation.find((item) => item.href === pathname) ?? navigation[0];
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="grid min-h-dvh lg:grid-cols-[245px_minmax(0,1fr)]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-line bg-white p-4 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:w-auto lg:translate-x-0",
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
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={current.id === item.id ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition",
                    current.id === item.id
                      ? "bg-sand text-ink shadow-[inset_0_0_0_1px_rgba(24,35,29,.03)]"
                      : "text-muted hover:bg-sand/70 hover:text-ink",
                  )}
                >
                  <Icon
                    size={18}
                    weight={current.id === item.id ? "bold" : "regular"}
                  />
                  {item.label}
                  {item.id === "billing" &&
                  data?.compensationLines.some(
                    (line) => line.status === "pending",
                  ) ? (
                    <span className="ml-auto size-2 rounded-full bg-coral" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex items-center gap-3 rounded-2xl border border-line p-3">
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
          <header className="sticky top-0 z-20 flex h-[78px] items-center justify-between border-b border-line bg-white/85 px-4 backdrop-blur-xl sm:px-7">
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
          <main className="p-4 sm:p-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
