"use client";

import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Brand } from "~/components/brand";
import { Button } from "~/components/ui/button";
import { Field, Input } from "~/components/ui/field";

export type LoginActionState = {
  email?: string;
  message?: string;
  fieldErrors?: { email?: string; password?: string };
};

type LoginAction = (
  state: LoginActionState,
  formData: FormData,
) => Promise<LoginActionState>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Comprobando acceso…" : "Entrar al backoffice"}
      {pending ? null : <ArrowRight size={17} />}
    </Button>
  );
}

export function LoginView({ action }: { action: LoginAction }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <main className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(420px,560px)_1fr]">
      <section className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:px-14 lg:py-10">
        <Brand />
        <div className="my-auto w-full max-w-md py-12">
          <div className="mb-7 grid size-12 place-items-center rounded-2xl bg-forest text-white shadow-[0_12px_30px_rgba(24,62,50,.2)]">
            <LockKeyhole size={21} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[.17em] text-coral">
            Acceso privado
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">
            Bienvenido de nuevo
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Identifícate para gestionar reservas, agenda y facturación de la
            academia.
          </p>

          <form action={formAction} className="mt-8 grid gap-5" noValidate>
            <Field label="Email" error={state.fieldErrors?.email}>
              <Input
                name="email"
                type="email"
                defaultValue={state.email}
                autoComplete="username"
                placeholder="tu@email.com"
                required
              />
            </Field>
            <Field label="Contraseña" error={state.fieldErrors?.password}>
              <Input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                required
              />
            </Field>
            {state.message ? (
              <p
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {state.message}
              </p>
            ) : null}
            <SubmitButton />
          </form>
          <div className="mt-6 flex items-start gap-2.5 text-xs leading-5 text-muted">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-forest" />
            Sesión privada protegida mediante una cookie segura y limitada al
            área de administración.
          </div>
        </div>
        <Link
          href="/booking"
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          ← Volver a la web de reservas
        </Link>
      </section>
      <aside className="relative hidden overflow-hidden bg-forest lg:block">
        <Image
          src="/teachers/toni-planells.webp"
          alt="Toni Planells en el campo de golf"
          fill
          priority
          className="object-cover opacity-75"
          sizes="60vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(24,62,50,.15),rgba(24,62,50,.9))]" />
        <div className="absolute inset-x-12 bottom-12 max-w-xl text-white">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-white/55">
            Golf Natural Guidance
          </p>
          <p className="mt-4 text-3xl font-medium leading-tight tracking-[-.03em]">
            Todo lo que necesitas para dirigir la academia, en un único lugar.
          </p>
        </div>
      </aside>
    </main>
  );
}
