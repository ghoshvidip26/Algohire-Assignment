import { query } from "../lib/db";
import type { AnomalyType } from "../services/monitoring-store";

export type AnomalyRecord = {
  id: string;
  sensor_id: string;
  type: AnomalyType;
  details: string;
  reading_timestamp: Date | null;
  detected_at: Date;
  suppressed: boolean;
};

export const anomalyRepo = {
  async create(input: {
    sensorId: string;
    type: AnomalyType;
    details: string;
    readingTimestamp: string | null;
    suppressed: boolean;
  }) {
    const result = await query<AnomalyRecord>(
      `
        INSERT INTO anomalies (
          sensor_id,
          type,
          details,
          reading_timestamp,
          suppressed
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          sensor_id,
          type,
          details,
          reading_timestamp,
          detected_at,
          suppressed
      `,
      [
        input.sensorId,
        input.type,
        input.details,
        input.readingTimestamp ? new Date(input.readingTimestamp) : null,
        input.suppressed,
      ],
    );

    return result.rows[0];
  },
};
