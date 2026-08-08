"use client";

import {
  BarChart,
  type BarSeriesOption,
  LineChart,
  type LineSeriesOption,
} from "echarts/charts";
import {
  GridComponent,
  type GridComponentOption,
  TooltipComponent,
  type TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption, EChartsCoreOption } from "echarts/core";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatMoney } from "~/lib/format";

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
]);

type RevenueOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | GridComponentOption
  | TooltipComponentOption
>;
type RankingOption = ComposeOption<
  BarSeriesOption | GridComponentOption | TooltipComponentOption
>;

type RevenuePoint = {
  period: string;
  label: string;
  revenue: number;
  bookings: number;
};
type RankingPoint = {
  label: string;
  value: number;
  displayValue: string;
  color: string;
  detail: string;
};

export function RevenueECharts({ data }: { data: RevenuePoint[] }) {
  const [months, setMonths] = useState<3 | 6>(6);
  const visibleData = useMemo(() => data.slice(-months), [data, months]);
  const total = visibleData.reduce((sum, item) => sum + item.revenue, 0);
  const bookings = visibleData.reduce((sum, item) => sum + item.bookings, 0);

  return (
    <section className="surface overflow-hidden rounded-[22px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">
            Pulso comercial
          </p>
          <h2 className="mt-2 font-semibold">Cobros y reservas</h2>
        </div>
        <div className="flex items-center gap-2">
          <fieldset className="flex rounded-xl bg-sand p-1">
            <legend className="sr-only">Periodo del gráfico</legend>
            {([3, 6] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setMonths(period)}
                aria-pressed={months === period}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${months === period ? "bg-white text-forest shadow-sm" : "text-muted"}`}
              >
                {period} meses
              </button>
            ))}
          </fieldset>
          <div className="rounded-xl bg-sand px-3 py-2 text-right">
            <strong className="block text-sm">{formatMoney(total)}</strong>
            <span className="text-[10px] text-muted">{bookings} reservas</span>
          </div>
        </div>
      </div>
      <div className="mt-4" aria-live="polite">
        <RevenuePlot data={visibleData} />
      </div>
      <div className="mt-2 flex gap-4 text-[10px] font-medium text-muted">
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-full bg-coral" aria-hidden="true" />
          Cobros
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-sm bg-[#b8d6c9]" aria-hidden="true" />
          Reservas pagadas
        </span>
      </div>
    </section>
  );
}

function RevenuePlot({ data }: { data: RevenuePoint[] }) {
  const buildOption = useCallback(
    (reducedMotion: boolean): RevenueOption => ({
      animation: !reducedMotion,
      animationDuration: 650,
      animationEasing: "cubicOut",
      grid: { top: 18, right: 34, bottom: 12, left: 0, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#18231d",
        borderWidth: 0,
        padding: [9, 12],
        textStyle: { color: "#ffffff", fontSize: 12 },
        formatter: (params) => {
          const points = Array.isArray(params) ? params : [params];
          return [
            `<strong>${points[0]?.name ?? ""}</strong>`,
            ...points.map((point) =>
              point.seriesName === "Cobros"
                ? `${point.marker} Cobros: ${formatMoney(Number(point.value))}`
                : `${point.marker} Reservas pagadas: ${point.value}`,
            ),
          ].join("<br />");
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((item) => item.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#68736c", fontSize: 10, margin: 12 },
      },
      yAxis: [
        {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#68736c",
            fontSize: 10,
            formatter: (value) => formatMoney(Number(value)),
          },
          splitLine: { lineStyle: { color: "#e4e5df", type: "dashed" } },
        },
        {
          type: "value",
          position: "right",
          minInterval: 1,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "#68736c", fontSize: 10 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Reservas pagadas",
          type: "bar",
          yAxisIndex: 1,
          barMaxWidth: 24,
          data: data.map((item) => item.bookings),
          itemStyle: { color: "#b8d6c9", borderRadius: [5, 5, 0, 0] },
        },
        {
          name: "Cobros",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: data.map((item) => item.revenue),
          lineStyle: { color: "#e96f4c", width: 3 },
          itemStyle: { color: "#e96f4c" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(233, 111, 76, .35)" },
              { offset: 1, color: "rgba(233, 111, 76, 0)" },
            ]),
          },
        },
      ],
    }),
    [data],
  );
  const elementRef = useChart(buildOption);

  return (
    <div
      ref={elementRef}
      className="h-56 w-full"
      role="img"
      aria-label="Evolución de cobros y reservas pagadas"
    />
  );
}

export function RankingECharts({
  data,
  percentage = false,
}: {
  data: RankingPoint[];
  percentage?: boolean;
}) {
  const buildOption = useCallback(
    (reducedMotion: boolean): RankingOption => ({
      animation: !reducedMotion,
      animationDuration: 500,
      animationEasing: "cubicOut",
      grid: { top: 2, right: 12, bottom: 2, left: 0, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#18231d",
        borderWidth: 0,
        padding: [9, 12],
        textStyle: { color: "#ffffff", fontSize: 12 },
        valueFormatter: (value) =>
          percentage
            ? `${Math.round(Number(value) * 100)}%`
            : formatMoney(Number(value)),
      },
      xAxis: { type: "value", show: false, max: percentage ? 1 : undefined },
      yAxis: {
        type: "category",
        inverse: true,
        data: data.map((item) => item.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#18231d",
          fontSize: 11,
          width: 112,
          overflow: "truncate",
        },
      },
      series: [
        {
          name: "Valor",
          type: "bar",
          barWidth: 12,
          data: data.map((item) => ({
            value: item.value,
            itemStyle: { color: item.color, borderRadius: [0, 8, 8, 0] },
          })),
          itemStyle: { borderRadius: [0, 8, 8, 0] },
        },
      ],
    }),
    [data, percentage],
  );
  const elementRef = useChart(buildOption);

  return (
    <div
      ref={elementRef}
      className="mt-5 h-32 w-full"
      role="img"
      aria-label="Comparativa de rendimiento"
    />
  );
}

export function PerformanceOverview({
  sections,
}: {
  sections: {
    id: string;
    label: string;
    description: string;
    empty: string;
    percentage?: boolean;
    items: RankingPoint[];
  }[];
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const active =
    sections.find((section) => section.id === activeId) ?? sections[0];
  if (!active) return null;

  return (
    <section className="surface rounded-[22px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">
            Rendimiento
          </p>
          <h2 className="mt-2 font-semibold">Qué está funcionando mejor</h2>
        </div>
        <div className="flex rounded-xl bg-sand p-1" role="tablist">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={active.id === section.id}
              onClick={() => setActiveId(section.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${active.id === section.id ? "bg-white text-forest shadow-sm" : "text-muted"}`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">{active.description}</p>
      {active.items.length ? (
        <>
          <RankingECharts data={active.items} percentage={active.percentage} />
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {active.items.map((item) => (
              <div
                key={item.label}
                className="flex min-w-0 items-start justify-between gap-2 rounded-xl bg-sand/60 px-3 py-2 text-xs"
              >
                <span className="min-w-0">
                  <strong className="block truncate">{item.label}</strong>
                  <span className="block truncate text-[10px] text-muted">
                    {item.detail}
                  </span>
                </span>
                <strong className="shrink-0">{item.displayValue}</strong>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-xl bg-sand p-3 text-sm text-muted">
          {active.empty}
        </p>
      )}
    </section>
  );
}

function useChart<TOption extends EChartsCoreOption>(
  buildOption: (reducedMotion: boolean) => TOption,
) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const chart = echarts.init(element, undefined, { renderer: "canvas" });
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    chart.setOption(buildOption(reducedMotion));
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(element);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [buildOption]);

  return elementRef;
}
