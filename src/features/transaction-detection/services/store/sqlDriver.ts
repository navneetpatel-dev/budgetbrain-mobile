/**
 * The small slice of SQLite the detection store needs. The app uses expo-sqlite; tests use an
 * in-memory sql.js database behind the same interface.
 */
export type SqlValue = string | number | null;

export interface SqlDriver {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlValue[]): Promise<{ changes: number }>;
  all<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  /** Runs `task` in one write transaction; rolls back if it throws. */
  transaction(task: () => Promise<void>): Promise<void>;
}

const DB_NAME = 'transaction-detection.db';

/** Opens the app-private database. Loaded lazily so tests and Expo Go never touch the native module. */
export async function openExpoDriver(): Promise<SqlDriver> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SQLite = require('expo-sqlite') as typeof import('expo-sqlite');
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  // WAL keeps the foreground reader and a headless writer from blocking each other.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;');
  return {
    exec: (sql) => db.execAsync(sql),
    run: async (sql, params = []) => {
      const result = await db.runAsync(sql, params);
      return { changes: result.changes };
    },
    all: (sql, params = []) => db.getAllAsync(sql, params),
    transaction: (task) => db.withTransactionAsync(task),
  };
}
