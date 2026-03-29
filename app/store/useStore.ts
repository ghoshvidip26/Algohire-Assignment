import type { GridAlert, Sensor } from "../lib/mock-data";
import { create } from "zustand";

type StoreState = {
  sensors: Sensor[];
  alerts: GridAlert[];
  setSensors: (data: Sensor[]) => void;
  setAlerts: (data: GridAlert[]) => void;
  updateSensor: (updated: Partial<Sensor> & Pick<Sensor, "id">) => void;
  addAlert: (alert: GridAlert) => void;
  updateAlert: (updated: GridAlert) => void;
};

export const useStore = create<StoreState>()((set) => ({
  sensors: [],
  alerts: [],

  setSensors: (data) => set({ sensors: data }),
  setAlerts: (data) => set({ alerts: data }),

  updateSensor: (updated) =>
    set((state) => ({
      sensors: state.sensors.map((sensor) =>
        sensor.id === updated.id ? { ...sensor, ...updated } : sensor,
      ),
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),

  updateAlert: (updated) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === updated.id ? updated : alert,
      ),
    })),
}));
