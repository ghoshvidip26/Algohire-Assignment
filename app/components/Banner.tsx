export function SuppressionBanner({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-[0_12px_30px_-24px_rgba(180,83,9,0.75)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
        Suppression Enabled
      </p>
      <p className="mt-2 text-sm leading-6">
        Non-critical notifications are currently muted for one or more sensors while field work is in progress.
      </p>
    </div>
  );
}
