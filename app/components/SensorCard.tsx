import type { Sensor } from "../lib/mock-data";
import { StatusBadge } from "./StatusBadge";

export default function SensorCard({ sensor }: { sensor: Sensor }) {
  return (
    <article className="rounded-3xl border border-(--border) bg-(--surface) p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {sensor.location}
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">
            {sensor.name}
          </h2>
        </div>
        <StatusBadge status={sensor.status} />
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-(--surface-muted) p-3">
          <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Voltage
          </dt>
          <dd className="mt-2 text-lg font-semibold">{sensor.voltage} V</dd>
        </div>
        <div className="rounded-2xl bg-(--surface-muted) p-3">
          <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Current
          </dt>
          <dd className="mt-2 text-lg font-semibold">{sensor.current} A</dd>
        </div>
        <div className="rounded-2xl bg-(--surface-muted) p-3">
          <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Temp
          </dt>
          <dd className="mt-2 text-lg font-semibold">{sensor.temperature} C</dd>
        </div>
      </dl>
    </article>
  );
}
