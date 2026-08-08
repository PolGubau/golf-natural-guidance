"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Check, Edit3, Plus, Power } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { saveTeacher } from "~/application/manage-demo";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field, Input, Select } from "~/components/ui/field";
import type { AvailabilityRule, DemoData, Teacher } from "~/domain/models";
import {
  type TeacherForm,
  type TeacherFormInput,
  teacherFormSchema,
} from "~/domain/schemas";
import { useDemo } from "~/infrastructure/state/demo-store";
import { categoryLabels, formatMoney, initials } from "~/lib/format";

export function TeachersView({ data }: { data: DemoData }) {
  const { commit } = useDemo();
  const [editing, setEditing] = useState<Teacher | null | undefined>();
  const toggle = (teacher: Teacher) =>
    void commit((current) =>
      saveTeacher(
        current,
        { ...teacher, active: !teacher.active },
        teacher.id,
        teacher.availability,
      ),
    );
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Equipo docente
          </h2>
          <p className="mt-1 text-sm text-muted">
            Tarifas, compensación y disponibilidad.
          </p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus size={16} /> Nuevo profesor
        </Button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.teachers.map((teacher) => (
          <article
            key={teacher.id}
            className={`surface rounded-[22px] p-5 transition ${teacher.active ? "" : "opacity-60 grayscale-[.35]"}`}
          >
            <div className="flex items-start gap-3">
              <span
                className="size-12 shrink-0 overflow-hidden rounded-full bg-sand"
                style={{ backgroundColor: teacher.color }}
              >
                {teacher.photoUrl ? (
                  <Image
                    src={teacher.photoUrl}
                    alt={`Foto de ${teacher.name}`}
                    width={48}
                    height={48}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-sm font-bold text-white">
                    {initials(teacher.name)}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate">{teacher.name}</strong>
                <span className="block truncate text-xs text-muted">
                  {teacher.publicRole}
                </span>
              </div>
              <Badge tone={teacher.active ? "success" : "neutral"}>
                {teacher.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-sand p-3">
                <span className="text-[10px] text-muted">Precio cliente</span>
                <strong className="mt-1 block">
                  {formatMoney(teacher.customerPrice)}
                </strong>
              </div>
              <div className="rounded-xl bg-sand p-3">
                <span className="text-[10px] text-muted">Tarifa interna</span>
                <strong className="mt-1 block">
                  {formatMoney(teacher.compensationRate)}/h
                </strong>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <CalendarClock size={14} />
                {availabilitySummary(teacher.availability)}
              </span>
              <span>{categoryLabels[teacher.category]}</span>
            </div>
            <div className="mt-5 flex gap-2 border-t border-line pt-4">
              <Button
                className="flex-1"
                variant="secondary"
                size="sm"
                onClick={() => setEditing(teacher)}
              >
                <Edit3 size={14} /> Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggle(teacher)}
                aria-label={
                  teacher.active
                    ? `Desactivar a ${teacher.name}`
                    : `Activar a ${teacher.name}`
                }
              >
                <Power size={15} />
              </Button>
            </div>
          </article>
        ))}
      </div>
      {editing !== undefined ? (
        <TeacherDialog
          teacher={editing}
          onClose={() => setEditing(undefined)}
        />
      ) : null}
    </div>
  );
}

function availabilitySummary(availability: AvailabilityRule[]) {
  if (!availability.length) return "Sin horario";
  const dayLabels = ["D", "L", "M", "X", "J", "V", "S"];
  const days = availability.map((rule) => dayLabels[rule.weekday]).join(" ");
  const first = availability[0];
  return `${days} · ${first.startTime}–${first.endTime}`;
}

function TeacherDialog({
  teacher,
  onClose,
}: {
  teacher: Teacher | null;
  onClose: () => void;
}) {
  const { commit } = useDemo();
  const [days, setDays] = useState<number[]>(
    teacher?.availability.map((rule) => rule.weekday) ?? [1, 2, 3, 4, 5],
  );
  const [startTime, setStartTime] = useState(
    teacher?.availability[0]?.startTime ?? "08:00",
  );
  const [endTime, setEndTime] = useState(
    teacher?.availability[0]?.endTime ?? "18:00",
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormInput, unknown, TeacherForm>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: teacher
      ? {
          name: teacher.name,
          publicRole: teacher.publicRole,
          category: teacher.category,
          customerPrice: teacher.customerPrice,
          compensationRate: teacher.compensationRate,
          active: teacher.active,
          color: teacher.color,
        }
      : {
          name: "",
          publicRole: "Profesor",
          category: "teacher",
          customerPrice: 85,
          compensationRate: 85,
          active: true,
          color: "#1e6b55",
        },
  });
  const submit = async (values: TeacherForm) => {
    const availability: AvailabilityRule[] = days.map((weekday) => ({
      weekday,
      startTime,
      endTime,
    }));
    await commit((data) =>
      saveTeacher(data, values, teacher?.id, availability),
    );
    onClose();
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={teacher ? "Editar profesor" : "Nuevo profesor"}
      description="Los cambios afectan a nuevas reservas; el histórico conserva sus precios."
    >
      <form onSubmit={handleSubmit(submit)} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Rol público" error={errors.publicRole?.message}>
            <Input {...register("publicRole")} />
          </Field>
          <Field label="Categoría">
            <Select {...register("category")}>
              <option value="teacher">Profesor</option>
              <option value="head_teacher">Head profesor</option>
              <option value="master_teacher">Master profesor</option>
            </Select>
          </Field>
          <Field label="Color">
            <Input type="color" className="p-1.5" {...register("color")} />
          </Field>
          <Field label="Precio cliente (€)">
            <Input type="number" step="0.01" {...register("customerPrice")} />
          </Field>
          <Field label="Compensación (€/h)">
            <Input
              type="number"
              step="0.01"
              {...register("compensationRate")}
            />
          </Field>
        </div>
        <fieldset className="rounded-2xl border border-line p-4">
          <legend className="px-1 text-sm font-semibold">
            Disponibilidad semanal
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              [1, "L"],
              [2, "M"],
              [3, "X"],
              [4, "J"],
              [5, "V"],
              [6, "S"],
              [0, "D"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() =>
                  setDays((current) =>
                    current.includes(Number(value))
                      ? current.filter((day) => day !== Number(value))
                      : [...current, Number(value)],
                  )
                }
                className={`grid size-9 place-items-center rounded-lg text-xs font-bold ${days.includes(Number(value)) ? "bg-forest text-white" : "bg-sand text-muted"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Desde">
              <Input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </Field>
            <Field label="Hasta">
              <Input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </Field>
          </div>
        </fieldset>
        <label className="flex items-center gap-3 rounded-xl bg-sand p-3 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4 accent-forest"
            {...register("active")}
          />{" "}
          Disponible para nuevas reservas
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !days.length}>
            <Check size={16} /> Guardar profesor
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
