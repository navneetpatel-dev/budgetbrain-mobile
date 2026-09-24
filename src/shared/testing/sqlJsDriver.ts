import type { SqlDriver, SqlValue } from '@/features/transaction-detection/services/store/sqlDriver';

/** An in-memory SQLite database (sql.js, asm.js build: no wasm loading in Jest) behind the detection store's driver interface. Tests only. */
export async function createSqlJsDriver(): Promise<SqlDriver> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const initSqlJs = require('sql.js/dist/sql-asm.js') as typeof import('sql.js').default;
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  return {
    exec: async (sql) => {
      db.exec(sql);
    },
    run: async (sql, params: SqlValue[] = []) => {
      db.run(sql, params);
      return { changes: db.getRowsModified() };
    },
    all: async <T>(sql: string, params: SqlValue[] = []) => {
      const statement = db.prepare(sql, params);
      const rows: T[] = [];
      while (statement.step()) rows.push(statement.getAsObject() as T);
      statement.free();
      return rows;
    },
    transaction: async (task) => {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

/** A valid sync payload for tests; `i` varies the fingerprint and client id. */
export function makeSyncPayload(i: number, overrides: Record<string, unknown> = {}) {
  return {
    clientId: `c${i}`,
    amount: '10.00',
    currency: 'INR',
    direction: 'DEBIT' as const,
    transactionType: 'expense' as const,
    subtype: null,
    paymentMethod: null,
    institutionId: 'in.hdfc_bank',
    accountTail: '1234',
    referenceNumber: `REF${i}`,
    merchantName: null,
    merchantId: null,
    taxonomyCode: null,
    categoryId: null,
    categorySource: null,
    financialAccountId: null,
    transactionDate: '2026-09-23',
    receivedAt: '2026-09-23T04:30:00.000Z',
    evidence: {
      templateMatched: false,
      institutionVerified: true,
      amountRoleUnique: true,
      directionUnambiguous: true,
      merchantKnown: false,
      dateExtracted: true,
      referencePresent: true,
      merchantFuzzy: false,
    },
    confidenceTier: 'high' as const,
    dedupFingerprint: `v2_${String(i).padStart(64, '0')}`,
    source: 'android_sms' as const,
    ...overrides,
  };
}
