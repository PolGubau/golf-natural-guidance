import {
  ArrowRightIcon as ArrowRight,
  CalendarDotsIcon as Calendar,
  ChartLineUpIcon as ChartLine,
  CheckCircleIcon as CheckCircle,
  CreditCardIcon as CreditCard,
  LightningIcon as Lightning,
  UsersThreeIcon as Users,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3 font-semibold tracking-tight"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-forest text-xs font-bold text-white">
            AD
          </span>
          <span>
            <span className="block leading-none">Academia Demo</span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[.18em] text-muted">
              Caso de estudio
            </span>
          </span>
        </Link>
        <nav
          className="hidden items-center gap-7 text-sm font-medium text-muted md:flex"
          aria-label="Navegación principal"
        >
          <a href="#producto" className="transition hover:text-ink">
            Producto
          </a>
          <a href="#flujo" className="transition hover:text-ink">
            Cómo funciona
          </a>
          <a href="#resultado" className="transition hover:text-ink">
            Resultado
          </a>
        </nav>
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest"
        >
          Ver demo <ArrowRight size={16} />
        </Link>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute -right-40 -top-24 size-[34rem] rounded-full bg-coral/10 blur-3xl" />
        <div className="relative grid items-center gap-14 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-forest">
              <span className="size-1.5 rounded-full bg-coral" />
              Producto digital para servicios
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-[5.25rem]">
              Menos gestión. <span className="text-forest">Más tiempo</span>{" "}
              para el alumno.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted sm:text-xl">
              Una plataforma integral para academias de golf: reservas, agenda,
              clientes, cobros y facturación conectados en una sola experiencia.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(233,111,76,.22)] transition hover:bg-coral-dark"
              >
                Probar experiencia de reserva <ArrowRight size={17} />
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3.5 text-sm font-bold transition hover:border-forest/30 hover:bg-sand"
              >
                Explorar backoffice
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted">
              Demo navegable · Datos ficticios · Diseñada para crecer
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-forest/5 blur-2xl" />
            <div className="relative rounded-[2rem] border border-forest/10 bg-forest p-3 shadow-[0_28px_80px_rgba(24,62,50,.2)] sm:p-5">
              <div className="rounded-[1.35rem] bg-canvas p-4 sm:p-6">
                <div className="flex items-center justify-between border-b border-line pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">
                      Resumen semanal
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">
                      Todo bajo control
                    </p>
                  </div>
                  <span className="rounded-full bg-forest/10 px-3 py-1.5 text-xs font-bold text-forest">
                    Esta semana
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-5 sm:gap-3">
                  <Metric label="Reservas" value="48" tone="forest" />
                  <Metric label="Ingresos" value="2.840 €" tone="coral" />
                  <Metric label="Alumnos" value="126" tone="sand" />
                </div>
                <div className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Actividad de reservas
                      </p>
                      <p className="mt-1 text-xs text-muted">Últimos 7 días</p>
                    </div>
                    <ChartLine size={21} className="text-forest" />
                  </div>
                  <div className="mt-6 flex h-28 items-end gap-2 sm:gap-3">
                    {[
                      ["L", 38],
                      ["M", 58],
                      ["X", 46],
                      ["J", 76],
                      ["V", 64],
                      ["S", 88],
                      ["D", 70],
                    ].map(([day, height]) => (
                      <div
                        key={day}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div
                          className="w-full rounded-t-lg bg-forest/15"
                          style={{ height: `${height}%` }}
                        >
                          <div className="h-2/3 w-full rounded-t-lg bg-forest" />
                        </div>
                        <span className="text-[10px] text-muted">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-sand p-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-white text-coral">
                    <Calendar size={18} weight="duotone" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">Próxima clase</p>
                    <p className="truncate text-xs text-muted">
                      Clase privada · 10:00
                    </p>
                  </div>
                  <CheckCircle
                    size={18}
                    className="text-forest"
                    weight="fill"
                  />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-xl sm:flex">
              <span className="grid size-10 place-items-center rounded-xl bg-coral/10 text-coral">
                <Lightning size={20} weight="fill" />
              </span>
              <div>
                <p className="text-xs font-bold">Automatizaciones</p>
                <p className="text-[11px] text-muted">
                  Menos tareas repetitivas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="producto" className="border-y border-line bg-white/55">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">
              Una operación, un sistema
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
              La experiencia completa, de la primera visita al cierre de mes.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Calendar />}
              title="Reservas sin fricción"
              text="El alumno encuentra servicio, profesor y horario en pocos pasos."
            />
            <Feature
              icon={<Users />}
              title="Clientes conectados"
              text="Historial, datos y seguimiento en una vista clara para el equipo."
            />
            <Feature
              icon={<CreditCard />}
              title="Cobros y facturas"
              text="Pagos, liquidaciones y documentos listos para revisar."
            />
            <Feature
              icon={<Lightning />}
              title="Automatización"
              text="Las tareas repetitivas se convierten en oportunidades de seguimiento."
            />
          </div>
        </div>
      </section>

      <section
        id="flujo"
        className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-28"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">
            Pensada para el día a día
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            De la intención a la acción, sin pasos innecesarios.
          </h2>
          <p className="mt-5 leading-7 text-muted">
            La demo muestra cómo una operación compleja puede sentirse sencilla
            cuando cada módulo comparte el mismo contexto.
          </p>
          <Link
            href="/booking"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-forest hover:text-coral"
          >
            Ver el flujo completo <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Step
            number="01"
            title="El alumno reserva"
            text="Una interfaz pública, directa y adaptada a móvil."
          />
          <Step
            number="02"
            title="El equipo gestiona"
            text="Agenda, clientes y actividades desde el backoffice."
          />
          <Step
            number="03"
            title="El negocio aprende"
            text="Datos y automatizaciones para tomar mejores decisiones."
          />
        </div>
      </section>

      <section
        id="resultado"
        className="mx-5 mb-8 rounded-[2rem] bg-forest px-6 py-14 text-white sm:mx-8 sm:px-12 lg:mx-auto lg:max-w-7xl lg:px-16 lg:py-20"
      >
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/55">
              Un ejemplo de producto digital
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-.04em] sm:text-5xl">
              Una base sólida para ofrecer una experiencia más cuidada.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-white/65">
              Explora la demo con calma y descubre cómo se unen la experiencia
              pública y la operación interna.
            </p>
          </div>
          <Link
            href="/booking"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-3.5 text-sm font-bold text-white transition hover:bg-coral-dark"
          >
            Entrar en la demo <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <span>Academia Demo · Caso de estudio</span>
        <span>Diseño y desarrollo de producto digital</span>
      </footer>
    </main>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "forest" | "coral" | "sand";
}) {
  const styles = {
    forest: "bg-forest/10 text-forest",
    coral: "bg-coral/10 text-coral",
    sand: "bg-sand text-ink",
  };
  return (
    <div className={`rounded-2xl p-3 sm:p-4 ${styles[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
      <span className="grid size-10 place-items-center rounded-xl bg-forest/10 text-forest [&>svg]:size-5">
        {icon}
      </span>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </article>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article className="border-t border-line pt-4">
      <span className="text-xs font-bold tracking-[.16em] text-coral">
        {number}
      </span>
      <h3 className="mt-7 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </article>
  );
}
