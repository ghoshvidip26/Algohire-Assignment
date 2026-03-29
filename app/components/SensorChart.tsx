import type { Sensor } from "../lib/mock-data";

export function SensorChart({ sensors }: { sensors: Sensor[] }) {
  return (
    <section className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Load Trend
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Sensor activity over the last 7 intervals
          </h2>
        </div>
        <p className="text-sm text-slate-500">Normalized signal score</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="rounded-2xl bg-(--surface-muted) p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{sensor.name}</p>
                <p className="text-sm text-slate-500">{sensor.location}</p>
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {sensor.id}
              </p>
            </div>

            <div className="mt-5 flex h-28 items-end gap-2">
              {sensor.trend.map((point, index) => (
                <div key={`${sensor.id}-${index}`} className="flex-1">
                  <div
                    className="w-full rounded-t-full bg-linear-to-t from-teal-700 to-teal-300"
                    style={{ height: `${Math.max(point, 6)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
