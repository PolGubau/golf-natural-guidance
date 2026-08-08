"use client";

import {
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
  SquaresFourIcon as LayoutDashboard,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { createBooking } from "~/application/create-booking";
import { Brand } from "~/components/brand";
import { Button } from "~/components/ui/button";
import { ErrorState, LoadingState } from "~/components/ui/states";
import { getAvailableSlots, getAvailableTeacherSlots } from "~/domain/booking";
import type { DemoData } from "~/domain/models";
import { useClientSession, useDemo } from "~/infrastructure/state/demo-store";
import { localDateKey, upcomingDays } from "~/lib/dates";
import { BookingSummary } from "./booking-summary";
import { ClientAccessStep } from "./client-access-step";
import { Confirmation } from "./confirmation";
import { DetailsStep } from "./details-step";
import { PaymentStep } from "./payment-step";
import { ScheduleStep } from "./schedule-step";
import { ServiceStep } from "./service-step";
import type { BookingDraft } from "./types";

const steps = ["Experiencia", "Horario", "Acceso", "Tus datos", "Pago"];

function initialDraft(): BookingDraft {
  return {
    mode: null,
    discoveryMode: null,
    teacherId: "",
    productId: "",
    date: localDateKey(upcomingDays(1)[0]),
    startsAt: "",
    endsAt: "",
    playerCount: 1,
    memberType: "unknown",
    goal: "",
    paymentMethod: "online",
  };
}

export function BookingExperience() {
  const { data, status, recovered, commit } = useDemo();
  const {
    session: clientSession,
    status: clientSessionStatus,
    signInWithGoogle,
    signOut,
  } = useClientSession();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>(initialDraft);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [accessPending, setAccessPending] = useState(false);
  const [accessError, setAccessError] = useState<string>();
  const flowRef = useRef<HTMLElement>(null);
  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    requestAnimationFrame(() => {
      flowRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      flowRef.current?.focus({ preventScroll: true });
    });
  };

  if (status === "loading" || !data) return <LoadingState />;
  if (status === "error") return <ErrorState />;
  if (confirmed)
    return (
      <>
        <BookingHeader />
        <Confirmation
          data={data}
          draft={draft}
          onRestart={() => {
            setDraft(initialDraft());
            setConfirmed(false);
            goToStep(0);
          }}
        />
      </>
    );

  const patchDraft = (patch: Partial<BookingDraft>) =>
    setDraft((current) => ({
      ...current,
      ...patch,
      ...(patch.mode === "group_activity"
        ? { paymentMethod: "online" as const }
        : {}),
    }));
  const canContinue =
    step === 0
      ? draft.mode === "group_activity"
        ? Boolean(draft.activityId)
        : draft.mode === "private_lesson"
          ? draft.discoveryMode === "schedule_first" || Boolean(draft.teacherId)
          : false
      : step === 1
        ? Boolean(draft.teacherId && draft.startsAt && draft.endsAt)
        : true;
  const customerForSession = (session: NonNullable<typeof clientSession>) => {
    const profile = data.students.find(
      (student) =>
        student.authUserId === session.user.id ||
        student.email.toLowerCase() === session.user.email.toLowerCase(),
    );
    return {
      name: profile?.name ?? session.user.name,
      email: profile?.email ?? session.user.email,
      phone: profile?.phone ?? "",
    };
  };
  const continueFromSchedule = () => {
    if (clientSession) {
      patchDraft({ customer: customerForSession(clientSession) });
      goToStep(3);
      return;
    }
    goToStep(2);
  };
  const continueFromExperience = () => {
    if (draft.mode === "group_activity") {
      if (clientSession) {
        patchDraft({ customer: customerForSession(clientSession) });
        goToStep(3);
      } else goToStep(2);
      return;
    }
    const date = firstAvailableDate(
      data,
      draft.discoveryMode === "teacher_first" ? draft.teacherId : undefined,
    );
    patchDraft({ date: date ?? draft.date, startsAt: "", endsAt: "" });
    goToStep(1);
  };
  const accessWithGoogle = async () => {
    setAccessPending(true);
    setAccessError(undefined);
    try {
      const session = await signInWithGoogle();
      patchDraft({ customer: customerForSession(session) });
      goToStep(3);
    } catch {
      setAccessError("No hemos podido iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setAccessPending(false);
    }
  };
  const changeClientAccount = async () => {
    await signOut();
    patchDraft({ customer: undefined });
    goToStep(2);
  };
  const submit = async () => {
    if (!draft.customer || !draft.mode || !clientSession) return;
    const mode = draft.mode;
    const customer = draft.customer;
    setSubmitting(true);
    setError(undefined);
    try {
      await commit((current) =>
        createBooking(current, {
          type: mode,
          authUserId: clientSession.user.id,
          teacherId: draft.teacherId,
          productId: draft.productId,
          activityId: draft.activityId,
          startsAt: draft.startsAt,
          endsAt: draft.endsAt,
          playerCount: draft.playerCount,
          memberType: draft.memberType,
          goal: draft.goal || undefined,
          paymentMethod: draft.paymentMethod,
          customer,
        }),
      );
      setConfirmed(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo confirmar la reserva.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_90%_15%,rgba(233,111,76,.11),transparent_25%),radial-gradient(circle_at_10%_80%,rgba(24,62,50,.08),transparent_25%)]">
      <BookingHeader />
      <main className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 lg:py-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-[-.035em] sm:text-3xl">
            Juega mejor, de forma natural.
          </h1>
        </div>
        {recovered ? (
          <div className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Se detectó un problema con los datos y se restauró una copia segura.
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section
            ref={flowRef}
            tabIndex={-1}
            className="surface scroll-mt-4 overflow-hidden rounded-[28px] outline-none"
          >
            <Progress current={step} />
            <div className="min-h-[480px] p-5 sm:p-8">
              {step === 0 ? (
                <ServiceStep data={data} draft={draft} onChange={patchDraft} />
              ) : null}
              {step === 1 ? (
                <ScheduleStep data={data} draft={draft} onChange={patchDraft} />
              ) : null}
              {step === 2 ? (
                <ClientAccessStep
                  onGoogle={() => void accessWithGoogle()}
                  pending={accessPending}
                  error={accessError}
                />
              ) : null}
              {step === 3 ? (
                <DetailsStep
                  draft={draft}
                  accountEmail={clientSession?.user.email ?? ""}
                  emailLocked
                  onChangeAccount={() => void changeClientAccount()}
                  onGoal={(goal) => patchDraft({ goal })}
                  onSubmit={(customer) => {
                    patchDraft({ customer });
                    goToStep(4);
                  }}
                />
              ) : null}
              {step === 4 ? (
                <PaymentStep
                  draft={draft}
                  onChange={patchDraft}
                  onConfirm={submit}
                  submitting={submitting}
                  error={error}
                />
              ) : null}
            </div>
            {step < 2 ? (
              <footer className="flex items-center justify-between border-t border-line bg-white/55 px-5 py-4 sm:px-8">
                <Button
                  variant="ghost"
                  disabled={step === 0}
                  onClick={() => goToStep(step - 1)}
                >
                  <ArrowLeft size={17} /> Atrás
                </Button>
                <Button
                  disabled={!canContinue || clientSessionStatus === "loading"}
                  onClick={() =>
                    step === 0
                      ? continueFromExperience()
                      : continueFromSchedule()
                  }
                >
                  Continuar <ArrowRight size={17} />
                </Button>
              </footer>
            ) : step <= 3 ? (
              <footer className="border-t border-line bg-white/55 px-5 py-3 sm:px-8">
                <Button
                  variant="ghost"
                  onClick={() =>
                    goToStep(draft.mode === "group_activity" ? 0 : 1)
                  }
                >
                  <ArrowLeft size={17} />
                  {draft.mode === "group_activity"
                    ? "Volver a experiencias"
                    : "Volver al horario"}
                </Button>
              </footer>
            ) : (
              <footer className="border-t border-line bg-white/55 px-5 py-3 sm:px-8">
                <Button variant="ghost" onClick={() => goToStep(3)}>
                  <ArrowLeft size={17} /> Revisar datos
                </Button>
              </footer>
            )}
          </section>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <BookingSummary data={data} draft={draft} />
          </div>
        </div>
      </main>
    </div>
  );
}

function firstAvailableDate(data: DemoData, teacherId?: string) {
  return upcomingDays(8)
    .map(localDateKey)
    .find((date) =>
      teacherId
        ? getAvailableSlots(data, teacherId, date).some(
            (slot) => slot.available,
          )
        : getAvailableTeacherSlots(data, date).length > 0,
    );
}

function BookingHeader() {
  return (
    <header className="border-b border-line/80 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-5 sm:px-6">
        <Brand />
        <Link
          href="/admin"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold shadow-xs transition hover:bg-sand"
        >
          <LayoutDashboard size={16} />{" "}
          <span className="hidden sm:inline">Abrir backoffice</span>
        </Link>
      </div>
    </header>
  );
}

function Progress({ current }: { current: number }) {
  return (
    <nav
      aria-label="Progreso de la reserva"
      className="scrollbar-none overflow-x-auto border-b border-line bg-white/55 px-5 sm:px-8"
    >
      <ol className="flex min-w-max items-center gap-2">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={index === current ? "step" : undefined}
            className={`relative flex h-16 items-center gap-2 px-2 text-xs font-semibold ${index <= current ? "text-ink" : "text-muted/55"}`}
          >
            <span
              className={`grid size-6 place-items-center rounded-full text-[10px] ${index < current ? "bg-forest text-white" : index === current ? "bg-coral text-white" : "bg-sand"}`}
            >
              {index + 1}
            </span>
            {label}
            {index === current ? (
              <span className="absolute right-2 bottom-0 left-2 h-0.5 rounded-full bg-coral" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
