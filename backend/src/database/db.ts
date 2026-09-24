import initSqlJs, { Database } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

let dbInstance: Database | null = null;
const dbDir = path.resolve(__dirname, '../../database');
const dbPath = path.join(dbDir, 'heatguard.sqlite');

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(filebuffer);
  } else {
    dbInstance = new SQL.Database();
    persistDatabase(dbInstance);
  }

  return dbInstance;
}

export function persistDatabase(db?: Database): void {
  const targetDb = db || dbInstance;
  if (!targetDb) return;
  try {
    const data = targetDb.export();
    const buffer = Buffer.from(data);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database to disk:', err);
  }
}

/**
 * Execute raw SQL commands (DDL/DML)
 */
export async function execSql(sql: string): Promise<void> {
  const db = await getDatabase();
  db.exec(sql);
  persistDatabase(db);
}

/**
 * Run a parameterized query returning all rows as objects
 */
export async function queryRows<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return rows;
}

/**
 * Run a parameterized query returning a single row as object
 */
export async function queryRow<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryRows<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Run an INSERT/UPDATE/DELETE query and persist
 */
export async function runQuery(sql: string, params: any[] = []): Promise<void> {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  persistDatabase(db);
}
