import {
  CalendarDotsIcon as CalendarDays,
  ClockIcon as Clock3,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import type { DemoData } from "~/domain/models";
import { addDays, localDateKey } from "~/lib/dates";
import { formatTime, initials } from "~/lib/format";

export function AgendaView({ data }: { data: DemoData }) {
  const [teacherFilter, setTeacherFilter] = useState("all");
  const days = Array.from({ length: 7 }, (_, index) =>
    addDays(new Date(), index),
  );
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Agenda semanal
          </h2>
          <p className="mt-1 text-sm text-muted">
            Disponibilidad y sesiones por profesor.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setTeacherFilter("all")}
            className={`rounded-full border px-3 py-2 text-xs font-semibold ${teacherFilter === "all" ? "border-forest bg-forest text-white" : "border-line bg-white text-muted"}`}
          >
            Todos
          </button>
          {data.teachers
            .filter((item) => item.active)
            .map((teacher) => (
              <button
                type="button"
                key={teacher.id}
                title={`Filtrar por ${teacher.name}`}
                onClick={() => setTeacherFilter(teacher.id)}
                className={`flex items-center gap-2 rounded-full border px-2 py-1.5 text-xs font-semibold ${teacherFilter === teacher.id ? "border-forest bg-sand text-ink" : "border-line bg-white text-muted"}`}
              >
                <span
                  className="size-6 overflow-hidden rounded-full"
                  style={{ backgroundColor: teacher.color }}
                >
                  {teacher.photoUrl ? (
                    <Image
                      src={teacher.photoUrl}
                      alt=""
                      width={24}
                      height={24}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-[8px] font-bold text-white">
                      {initials(teacher.name)}
                    </span>
                  )}
                </span>
                <span className="hidden sm:inline">
                  {teacher.name.split(" ")[0]}
                </span>
              </button>
            ))}
        </div>
      </div>
      <div className="mt-5 grid gap-3 xl:grid-cols-7">
        {days.map((day, index) => {
          const key = localDateKey(day);
          const bookings = data.bookings
            .filter(
              (booking) =>
                booking.startsAt.startsWith(key) &&
                booking.status !== "cancelled" &&
                (teacherFilter === "all" ||
                  booking.teacherId === teacherFilter),
            )
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
          const activities = data.activities.filter(
            (activity) =>
              activity.startsAt.startsWith(key) &&
              activity.active &&
              (teacherFilter === "all" || activity.teacherId === teacherFilter),
          );
          return (
            <section
              key={key}
              className={`surface min-h-44 rounded-[20px] p-3 ${index === 0 ? "ring-2 ring-coral/20" : ""}`}
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                    {new Intl.DateTimeFormat("es-ES", {
                      weekday: "short",
                    }).format(day)}
                  </span>
                  <strong className="text-lg">{day.getDate()}</strong>
                </div>
                {index === 0 ? (
                  <span className="rounded-full bg-coral px-2 py-1 text-[9px] font-bold text-white">
                    HOY
                  </span>
                ) : null}
              </div>
              <div className="mt-3 space-y-2">
                {activities.map((activity) => {
                  const teacher = data.teachers.find(
                    (item) => item.id === activity.teacherId,
                  );
                  return (
                    <article
                      key={activity.id}
                      className="rounded-xl p-2.5 text-white"
                      style={{ backgroundColor: activity.color }}
                    >
                      <span className="flex items-center gap-1 text-[9px] font-semibold opacity-75">
                        <Clock3 size={10} />
                        {formatTime(activity.startsAt)}
                      </span>
                      <strong className="mt-1 block text-xs leading-4">
                        {activity.name}
                      </strong>
                      <span className="mt-1 block truncate text-[9px] opacity-75">
                        {teacher?.name}
                      </span>
                    </article>
                  );
                })}
                {bookings
                  .filter((booking) => !booking.activityId)
                  .map((booking) => {
                    const teacher = data.teachers.find(
                      (item) => item.id === booking.teacherId,
                    );
                    const student = data.students.find(
                      (item) => item.id === booking.studentId,
                    );
                    return (
                      <article
                        key={booking.id}
                        className="rounded-xl border border-line bg-white p-2.5"
                      >
                        <span className="flex items-center gap-1 text-[9px] font-semibold text-muted">
                          <Clock3 size={10} />
                          {formatTime(booking.startsAt)}
                        </span>
                        <strong className="mt-1 block truncate text-xs">
                          {student?.name}
                        </strong>
                        <span
                          className="mt-1 block truncate text-[9px]"
                          style={{ color: teacher?.color }}
                        >
                          {teacher?.name}
                        </span>
                      </article>
                    );
                  })}
                {!bookings.length && !activities.length ? (
                  <div className="grid justify-items-center py-8 text-muted/45">
                    <CalendarDays size={18} />
                    <span className="mt-2 text-[10px]">Sin sesiones</span>
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl bg-white/50 p-3 text-xs text-muted">
        Las actividades ocupan una única franja en la agenda aunque tengan
        varias inscripciones. Las reservas canceladas liberan disponibilidad.
      </div>
    </div>
  );
}
