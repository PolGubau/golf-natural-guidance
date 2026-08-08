"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Clock3, Edit3, Plus, UsersRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { saveActivity } from "~/application/manage-demo";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field, Input, Select, Textarea } from "~/components/ui/field";
import { availablePlaces, enrolledCount } from "~/domain/booking";
import type { Activity, DemoData } from "~/domain/models";
import {
  type ActivityForm,
  type ActivityFormInput,
  activityFormSchema,
} from "~/domain/schemas";
import { useDemo } from "~/infrastructure/state/demo-store";
import { formatDate, formatMoney, formatTime } from "~/lib/format";

export function ActivitiesView({ data }: { data: DemoData }) {
  const { commit } = useDemo();
  const [editing, setEditing] = useState<Activity | null | undefined>();
  const toggle = (activity: Activity) =>
    void commit((current) =>
      saveActivity(
        current,
        {
          name: activity.name,
          description: activity.description,
          price: activity.price,
          memberPrice: activity.memberPrice,
          capacity: activity.capacity,
          teacherId: activity.teacherId,
          startsAt: activity.startsAt,
          endsAt: activity.endsAt,
          active: !activity.active,
        },
        activity.id,
      ),
    );
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Cursos y actividades
          </h2>
          <p className="mt-1 text-sm text-muted">
            Oferta reservable, plazas y horarios.
          </p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus size={16} /> Nueva actividad
        </Button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {[...data.activities]
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
          .map((activity) => {
            const teacher = data.teachers.find(
              (item) => item.id === activity.teacherId,
            );
            const enrolled = enrolledCount(activity.id, data.bookings);
            const places = availablePlaces(activity, data.bookings);
            return (
              <article
                key={activity.id}
                className={`surface overflow-hidden rounded-[22px] ${activity.active ? "" : "opacity-55"}`}
              >
                <div
                  className="h-2"
                  style={{ backgroundColor: activity.color }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[.14em] text-muted">
                        Actividad de grupo
                      </span>
                      <h3 className="mt-1 text-lg font-semibold">
                        {activity.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                        {activity.description}
                      </p>
                    </div>
                    <strong className="text-lg">
                      {formatMoney(activity.price)}
                    </strong>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-sand p-3">
                      <Clock3 size={14} className="text-muted" />
                      <strong className="mt-2 block text-xs">
                        {formatDate(activity.startsAt, {
                          day: "numeric",
                          month: "short",
                        })}
                      </strong>
                      <span className="text-[10px] text-muted">
                        {formatTime(activity.startsAt)}
                      </span>
                    </div>
                    <div className="rounded-xl bg-sand p-3">
                      <UsersRound size={14} className="text-muted" />
                      <strong className="mt-2 block text-xs">
                        {enrolled}/{activity.capacity}
                      </strong>
                      <span className="text-[10px] text-muted">
                        {places} libres
                      </span>
                    </div>
                    <div className="rounded-xl bg-sand p-3">
                      <span
                        className="grid size-4 place-items-center rounded-full text-[8px] font-bold text-white"
                        style={{ backgroundColor: teacher?.color }}
                      >
                        P
                      </span>
                      <strong className="mt-2 block truncate text-xs">
                        {teacher?.name}
                      </strong>
                      <span className="text-[10px] text-muted">Profesor</span>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2 border-t border-line pt-4">
                    <Button
                      className="flex-1"
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditing(activity)}
                    >
                      <Edit3 size={14} /> Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggle(activity)}
                    >
                      {activity.active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
      </div>
      {editing !== undefined ? (
        <ActivityDialog
          activity={editing}
          data={data}
          onClose={() => setEditing(undefined)}
        />
      ) : null}
    </div>
  );
}

function ActivityDialog({
  activity,
  data,
  onClose,
}: {
  activity: Activity | null;
  data: DemoData;
  onClose: () => void;
}) {
  const { commit } = useDemo();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormInput, unknown, ActivityForm>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: activity
      ? {
          name: activity.name,
          description: activity.description,
          price: activity.price,
          memberPrice: activity.memberPrice,
          capacity: activity.capacity,
          teacherId: activity.teacherId,
          startsAt: activity.startsAt.slice(0, 16),
          endsAt: activity.endsAt.slice(0, 16),
          active: activity.active,
        }
      : {
          name: "",
          description: "",
          price: 45,
          memberPrice: 40,
          capacity: 8,
          teacherId: data.teachers.find((item) => item.active)?.id ?? "",
          startsAt: "",
          endsAt: "",
          active: true,
        },
  });
  const submit = async (values: ActivityForm) => {
    await commit((current) => saveActivity(current, values, activity?.id));
    onClose();
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={activity ? "Editar actividad" : "Nueva actividad"}
      description="Las actividades publicadas requieren pago online."
    >
      <form onSubmit={handleSubmit(submit)} className="grid gap-4">
        <Field label="Nombre" error={errors.name?.message}>
          <Input {...register("name")} />
        </Field>
        <Field label="Descripción" error={errors.description?.message}>
          <Textarea {...register("description")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Precio general (€)">
            <Input type="number" step="0.01" {...register("price")} />
          </Field>
          <Field label="Precio socio (€)">
            <Input type="number" step="0.01" {...register("memberPrice")} />
          </Field>
          <Field label="Capacidad">
            <Input type="number" {...register("capacity")} />
          </Field>
          <Field label="Profesor">
            <Select {...register("teacherId")}>
              {data.teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Inicio">
            <Input type="datetime-local" {...register("startsAt")} />
          </Field>
          <Field label="Fin">
            <Input type="datetime-local" {...register("endsAt")} />
          </Field>
        </div>
        <label className="flex items-center gap-3 rounded-xl bg-sand p-3 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4 accent-forest"
            {...register("active")}
          />{" "}
          Visible y reservable
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Check size={16} /> Guardar actividad
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
