import AlertsClient from "../components/AlertsClient";

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-4xl border border-(--border) bg-(--surface) px-6 py-7 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.5)]">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
          Alerts Workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Review, acknowledge, and close incidents from one aligned queue.
        </h1>
      </section>

      <AlertsClient />
    </div>
  );
}
