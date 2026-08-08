"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon as ArrowRight,
  CheckCircleIcon as CheckCircle,
} from "@phosphor-icons/react";
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
  accountEmail,
  onChangeAccount,
  emailLocked = false,
}: {
  draft: BookingDraft;
  onSubmit: (customer: CustomerForm) => void;
  onGoal: (goal: string) => void;
  accountEmail: string;
  onChangeAccount: () => void;
  emailLocked?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: draft.customer ?? {
      name: "",
      email: "",
      phone: "",
      fiscalId: "",
      fiscalAddress: "",
    },
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
          Revisa los datos guardados en tu cuenta antes de continuar.
        </p>
      </div>
      <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
        <CheckCircle className="mt-0.5 shrink-0" size={16} />
        <span className="min-w-0 flex-1">
          Has iniciado sesión como <strong>{accountEmail}</strong>. Los cambios
          que hagas se guardarán para tus próximas reservas.
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-emerald-800 hover:bg-emerald-100"
          onClick={onChangeAccount}
        >
          Cambiar cuenta
        </Button>
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
            readOnly={emailLocked}
            className={emailLocked ? "bg-sand text-muted" : undefined}
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
        <Field label="NIF, NIE o CIF" error={errors.fiscalId?.message}>
          <Input
            autoComplete="off"
            placeholder="12345678Z"
            {...register("fiscalId")}
          />
        </Field>
        <Field label="Dirección fiscal" error={errors.fiscalAddress?.message}>
          <Input
            autoComplete="street-address"
            placeholder="Calle, número, código postal y localidad"
            {...register("fiscalAddress")}
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
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Continuar al pago <ArrowRight size={17} />
        </Button>
      </div>
    </form>
  );
}
