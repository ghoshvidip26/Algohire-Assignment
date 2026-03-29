"use client";

import Dashboard from "./Dashboard";
import { useStore } from "../store/useStore";

export default function DashboardClient() {
  const sensors = useStore((state) => state.sensors);
  const alerts = useStore((state) => state.alerts);

  return <Dashboard alerts={alerts} sensors={sensors} />;
}
