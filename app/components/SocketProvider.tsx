"use client";
import { useEffect } from "react";
import { connectSocket } from "../lib/socket";
import { DEMO_USER_ID } from "../lib/session";
import { useStore } from "../store/useStore";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setSensors = useStore((s) => s.setSensors);
  const setAlerts = useStore((s) => s.setAlerts);
  const updateSensor = useStore((s) => s.updateSensor);
  const addAlert = useStore((s) => s.addAlert);
  const updateAlert = useStore((s) => s.updateAlert);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`/api/dashboard?userId=${encodeURIComponent(DEMO_USER_ID)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }

        return response.json() as Promise<{
          sensors: Parameters<typeof setSensors>[0];
          alerts: Parameters<typeof setAlerts>[0];
        }>;
      })
      .then((data) => {
        setSensors(data.sensors);
        setAlerts(data.alerts);
      })
      .catch(() => undefined);

    const disconnect = connectSocket(DEMO_USER_ID, (data) => {
      switch (data.type) {
        case "SENSOR_UPDATE":
          updateSensor(data.payload);
          break;

        case "ALERT_CREATED":
          addAlert(data.payload);
          break;

        case "ALERT_UPDATED":
          updateAlert(data.payload);
          break;
      }
    });

    return () => {
      controller.abort();
      disconnect();
    };
  }, [setSensors, setAlerts, updateSensor, addAlert, updateAlert]);
  return <>{children}</>;
}
