export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    healthy: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    warning: "bg-amber-100 text-amber-700 ring-amber-200",
    critical: "bg-rose-100 text-rose-700 ring-rose-200",
    silent: "bg-slate-200 text-slate-700 ring-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${map[status] ?? map.silent}`}
    >
      {status}
    </span>
  );
}
