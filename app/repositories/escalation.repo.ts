import { query } from "../lib/db";

type EscalationRecord = {
  id: string;
  alert_id: string;
  escalated_to: string;
  created_at: Date;
};

export const escalationRepo = {
  async create(input: { alertId: string; escalatedTo: string }) {
    const result = await query<EscalationRecord>(
      `
        INSERT INTO alert_escalations (
          alert_id,
          escalated_to
        )
        VALUES ($1, $2)
        RETURNING
          id,
          alert_id,
          escalated_to,
          created_at
      `,
      [input.alertId, input.escalatedTo],
    );

    return result.rows[0];
  },
};
