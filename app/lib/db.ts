import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from "pg";

type PgLikeError = Error & {
  code?: string;
};

declare global {
  var __algohirePgPool: Pool | undefined;
}

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return databaseUrl;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function isSchemaNotReadyError(error: unknown) {
  const pgError = error as PgLikeError;
  return pgError?.code === "42P01" || pgError?.code === "42703";
}

function getDb() {
  if (!globalThis.__algohirePgPool) {
    globalThis.__algohirePgPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return globalThis.__algohirePgPool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getDb().query<T>(text, values);
}

export async function withTransaction<T>(
  fn: (client: Pick<PoolClient, "query">) => Promise<T>,
) {
  const client = await getDb().connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export type DatabaseResult<T extends QueryResultRow> = QueryResult<T>;
