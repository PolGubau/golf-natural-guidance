"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Field, Input, Select } from "~/components/ui/field";
import { type CustomerForm, customerSchema } from "~/domain/schemas";
import type { BookingDraft } from "./types";

const goals = [
  "Putt",
  "Juego corto",
  "Juego largo",
  "Driver",
  "Salida al campo",
  "Vídeo-análisis",
  "Objetivo personalizado",
];

export function DetailsStep({
  draft,
  onSubmit,
  onGoal,
}: {
  draft: BookingDraft;
  onSubmit: (customer: CustomerForm) => void;
  onGoal: (goal: string) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: draft.customer ?? { name: "", email: "", phone: "" },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">
          Tus datos
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          ¿A nombre de quién reservamos?
        </h2>
        <p className="mt-1 text-sm text-muted">
          Solo utilizaremos estos datos para gestionar esta reserva de
          demostración.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre y apellidos" error={errors.name?.message}>
          <Input
            autoComplete="name"
            placeholder="Tu nombre"
            {...register("name")}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            {...register("email")}
          />
        </Field>
        <Field label="Teléfono (opcional)" error={errors.phone?.message}>
          <Input
            type="tel"
            autoComplete="tel"
            placeholder="+34 600 000 000"
            {...register("phone")}
          />
        </Field>
        <Field label="¿Qué quieres trabajar?">
          <Select
            value={draft.goal}
            onChange={(event) => onGoal(event.target.value)}
          >
            <option value="">Aún no lo sé</option>
            {goals.map((goal) => (
              <option key={goal}>{goal}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="rounded-2xl bg-sand p-4 text-xs leading-5 text-muted">
        Esta demo funciona exclusivamente en tu navegador. No se envía
        información a ningún servidor ni proveedor externo.
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Continuar al pago <ArrowRight size={17} />
        </Button>
      </div>
    </form>
  );
}
