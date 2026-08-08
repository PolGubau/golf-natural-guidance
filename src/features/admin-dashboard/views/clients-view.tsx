import {
  EnvelopeSimpleIcon as Mail,
  PhoneIcon as Phone,
  UserListIcon as UserRoundSearch,
} from "@phosphor-icons/react";
import { EmptyState } from "~/components/ui/states";
import type { DemoData } from "~/domain/models";
import { formatMoney, initials } from "~/lib/format";

export function ClientsView({ data }: { data: DemoData }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Clientes</h2>
      <p className="mt-1 text-sm text-muted">
        Perfiles creados desde las reservas locales.
      </p>
      {data.students.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.students.map((student) => {
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
                <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    Cobrado mock
                  </span>
                  <strong>{formatMoney(spent)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon={<UserRoundSearch />}
            title="Todavía no hay clientes"
            description="Los perfiles se crearán automáticamente al realizar una reserva."
          />
        </div>
      )}
    </div>
  );
}
