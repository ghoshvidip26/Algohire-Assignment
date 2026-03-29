import { query } from "../lib/db";
import type { AlertStatus } from "./alert.repo";

type AuditRecord = {
  id: string;
  alert_id: string;
  from_status: AlertStatus;
  to_status: AlertStatus;
  changed_by: string;
  created_at: Date;
};

export const auditRepo = {
  async create(input: {
    alertId: string;
    fromStatus: AlertStatus;
    toStatus: AlertStatus;
    changedBy: string;
  }) {
    const result = await query<AuditRecord>(
      `
        INSERT INTO alert_audits (
          alert_id,
          from_status,
          to_status,
          changed_by
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          alert_id,
          from_status,
          to_status,
          changed_by,
          created_at
      `,
      [input.alertId, input.fromStatus, input.toStatus, input.changedBy],
    );

    return result.rows[0];
  },
};
