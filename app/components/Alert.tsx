"use client";

import type { GridAlert } from "../lib/mock-data";
import { DEMO_USER_ID } from "../lib/session";

const severityStyles: Record<string, string> = {
  low: "bg-sky-100 text-sky-700 ring-sky-200",
  medium: "bg-amber-100 text-amber-700 ring-amber-200",
  high: "bg-rose-100 text-rose-700 ring-rose-200",
};

const stateStyles: Record<string, string> = {
  open: "text-rose-700",
  acknowledged: "text-amber-700",
  resolved: "text-emerald-700",
};

export default function AlertTable({ alerts }: { alerts: GridAlert[] }) {
  const userId = DEMO_USER_ID;
  async function handleAction(id: string, status: string) {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
      body: JSON.stringify({
        status,
      }),
    });
  }
  return (
    <section className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Incident Queue
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Operator alerts
          </h2>
        </div>
        <p className="text-sm text-slate-500">{alerts.length} active records</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-(--border)">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100/80 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Sensor</th>
              <th className="px-4 py-3 text-left font-medium">Severity</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Summary</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-(--border)">
            {alerts.map((alert) => (
              <tr key={alert.id} className="align-top">
                <td className="px-4 py-4">
                  <p className="font-semibold">{alert.sensorName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {alert.sensorId}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${severityStyles[alert.severity]}`}
                  >
                    {alert.severity}
                  </span>
                </td>
                <td
                  className={`px-4 py-4 font-semibold capitalize ${stateStyles[alert.status]}`}
                >
                  {alert.status}
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {alert.timestamp}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {alert.status === "open" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(alert.id, "acknowledged")}
                          className="rounded-full border border-(--border) bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          Acknowledge
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(alert.id, "resolved")}
                          className="rounded-full border border-(--border) bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Resolve
                        </button>
                      </>
                    )}

                    {alert.status === "acknowledged" && (
                      <button
                        type="button"
                        onClick={() => handleAction(alert.id, "resolved")}
                        className="rounded-full border border-(--border) bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {alerts.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-slate-500"
                  colSpan={5}
                >
                  No alerts in the queue.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
