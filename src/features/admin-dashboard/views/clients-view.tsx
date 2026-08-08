"use client";

import {
  ListBulletsIcon as ListBullets,
  EnvelopeSimpleIcon as Mail,
  PhoneIcon as Phone,
  UserListIcon as UserRoundSearch,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "~/components/ui/field";
import { EmptyState } from "~/components/ui/states";
import type { DemoData } from "~/domain/models";
import { formatMoney, initials } from "~/lib/format";

export function ClientsView({ data }: { data: DemoData }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const students = data.students.filter((student) =>
    !normalizedQuery
      ? true
      : [student.name, student.email, student.phone ?? ""].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
  );
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Clientes</h2>
      <p className="mt-1 text-sm text-muted">
        Perfiles creados desde las reservas.
      </p>
      <div className="mt-5 max-w-md">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, email o teléfono"
          aria-label="Buscar clientes por nombre, email o teléfono"
        />
      </div>
      {students.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => {
            const bookings = data.bookings.filter(
              (booking) => booking.studentId === student.id,
            );
            const spent = bookings
              .filter((booking) => booking.paymentStatus === "paid")
              .reduce((sum, booking) => sum + booking.customerPrice, 0);
            return (
              <article key={student.id} className="surface rounded-[20px] p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-forest text-xs font-bold text-white">
                    {initials(student.name)}
                  </span>
                  <div className="min-w-0">
                    <strong className="block truncate">{student.name}</strong>
                    <span className="text-xs text-muted">
                      {bookings.length} reserva
                      {bookings.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-xs text-muted">
                  <a
                    href={`mailto:${student.email}`}
                    className="flex items-center gap-2 truncate hover:text-ink"
                  >
                    <Mail size={14} />
                    {student.email}
                  </a>
                  <span className="flex items-center gap-2">
                    <Phone size={14} />
                    {student.phone || "Sin teléfono"}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted">
                      Cobrado
                    </span>
                    <strong className="block">{formatMoney(spent)}</strong>
                  </div>
                  <Link
                    href={`/admin/reservas?cliente=${encodeURIComponent(student.id)}`}
                    aria-label={`Ver historial de ${student.name}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-forest transition-colors hover:bg-forest/8"
                  >
                    <ListBullets size={15} /> Ver historial
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon={<UserRoundSearch />}
            title={
              query
                ? "No hay clientes que coincidan"
                : "Todavía no hay clientes"
            }
            description={
              query
                ? "Prueba con otro nombre, email o teléfono."
                : "Los perfiles se crearán automáticamente al realizar una reserva."
            }
          />
        </div>
      )}
    </div>
  );
}
