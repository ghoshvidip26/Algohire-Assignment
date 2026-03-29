import { query } from "../lib/db";

export type UserRole = "operator" | "supervisor";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_on_call: boolean;
};

export async function getSupervisor() {
  const result = await query<UserRecord>(
    `
      SELECT
        id,
        name,
        email,
        role,
        is_on_call
      FROM users
      WHERE role = 'supervisor'
      ORDER BY is_on_call DESC, name ASC
      LIMIT 1
    `,
  );

  const supervisor = result.rows[0];
  if (!supervisor) {
    throw new Error("No supervisor configured");
  }

  return supervisor;
}

export async function getUserById(userId: string) {
  const result = await query<UserRecord>(
    `
      SELECT
        id,
        name,
        email,
        role,
        is_on_call
      FROM users
      WHERE id = $1
    `,
    [userId],
  );

  const user = result.rows[0];
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  return user;
}

export async function getUserZoneIds(userId: string) {
  const result = await query<{ zone_id: string }>(
    `
      SELECT zone_id
      FROM user_zones
      WHERE user_id = $1
    `,
    [userId],
  );

  return result.rows.map((row) => row.zone_id);
}

export const userRepo = {
  async findById(id: string) {
    const res = await query(`SELECT id, role FROM users WHERE id = $1`, [id]);
    return res.rows[0];
  },

  async getUserZoneIds(userId: string) {
    return getUserZoneIds(userId);
  },
};
