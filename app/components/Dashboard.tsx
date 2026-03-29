import type { GridAlert, Sensor } from "../lib/mock-data";
import AlertTable from "./Alert";
import { SuppressionBanner } from "./Banner";
import SensorCard from "./SensorCard";
import { SensorChart } from "./SensorChart";

export default function Dashboard({
  sensors,
  alerts,
}: {
  sensors: Sensor[];
  alerts: GridAlert[];
}) {
  const healthySensors = sensors.filter(
    (sensor) => sensor.status === "healthy",
  ).length;
  const atRiskSensors = sensors.filter(
    (sensor) => sensor.status !== "healthy",
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-4xl border border-(--border) bg-(--surface) px-6 py-7 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.5)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
              Monitoring Overview
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Power-grid health dashboard built around a consistent layout
              system.
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-(--surface-muted) px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Sensors
              </p>
              <p className="mt-2 text-2xl font-semibold">{sensors.length}</p>
            </div>
            <div className="rounded-2xl bg-(--surface-muted) px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Healthy
              </p>
              <p className="mt-2 text-2xl font-semibold">{healthySensors}</p>
            </div>
            <div className="rounded-2xl bg-(--surface-muted) px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                At Risk
              </p>
              <p className="mt-2 text-2xl font-semibold">{atRiskSensors}</p>
            </div>
          </div>
        </div>
      </section>

      <SuppressionBanner active />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Sensor Network
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Live equipment status
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sensors.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <SensorChart sensors={sensors} />
        <section className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Priority Incidents
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            What needs attention now
          </h2>

          <div className="mt-6 space-y-4">
            {alerts.slice(0, 3).map((alert) => (
              <article
                key={alert.id}
                className="rounded-2xl border border-(--border) bg-(--surface-muted) p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{alert.sensorName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {alert.message}
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {alert.timestamp}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <AlertTable alerts={alerts} />
    </div>
  );
}
