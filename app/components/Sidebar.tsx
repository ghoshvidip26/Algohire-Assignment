import Link from "next/link";

export default function Sidebar() {
  const links = [
    { href: "/", label: "Overview", meta: "Live sensors" },
    { href: "/alerts", label: "Alerts", meta: "Operator queue" },
  ];

  return (
    <aside className="border-b border-(--border) bg-slate-950 text-slate-50 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-5 py-6 sm:px-6">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-300/80">
            Grid Operations
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            GridWatch
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
            Real-time visibility into substation health, active incidents, and
            operator load.
          </p>
        </div>

        <nav className="space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-teal-300/40 hover:bg-white/10"
            >
              <p className="text-sm font-semibold">{link.label}</p>
              <p className="mt-1 text-xs text-slate-300">{link.meta}</p>
            </Link>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-400/10 p-4 text-sm text-teal-50">
          <p className="font-semibold">System Status</p>
          <p className="mt-2 text-teal-100/80">
            32 sensors online, 3 alerts require review.
          </p>
        </div>
      </div>
    </aside>
  );
}
