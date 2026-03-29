import { query } from "../lib/db";

export type SuppressionRecord = {
  id: string;
  sensor_id: string;
  created_by: string;
  start_time: Date;
  end_time: Date;
  reason: string | null;
  created_at: Date;
};

export const suppressionRepo = {
  async create(input: {
    sensorId: string;
    createdBy: string;
    startTime: string;
    endTime: string;
    reason?: string;
  }) {
    const result = await query<SuppressionRecord>(
      `
        INSERT INTO sensor_suppressions (
          sensor_id,
          created_by,
          start_time,
          end_time,
          reason
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          sensor_id,
          created_by,
          start_time,
          end_time,
          reason,
          created_at
      `,
      [
        input.sensorId,
        input.createdBy,
        new Date(input.startTime),
        new Date(input.endTime),
        input.reason ?? null,
      ],
    );

    return result.rows[0];
  },

  async findActiveBySensorId(sensorId: string, at = new Date()) {
    const result = await query<SuppressionRecord>(
      `
        SELECT
          id,
          sensor_id,
          created_by,
          start_time,
          end_time,
          reason,
          created_at
        FROM sensor_suppressions
        WHERE sensor_id = $1
          AND start_time <= $2
          AND end_time >= $2
        ORDER BY start_time DESC
        LIMIT 1
      `,
      [sensorId, at],
    );

    return result.rows[0] ?? null;
  },
};
