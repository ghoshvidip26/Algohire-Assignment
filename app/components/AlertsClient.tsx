"use client";

import AlertTable from "./Alert";
import { useStore } from "../store/useStore";

export default function AlertsClient() {
  const alerts = useStore((state) => state.alerts);

  return <AlertTable alerts={alerts} />;
}
