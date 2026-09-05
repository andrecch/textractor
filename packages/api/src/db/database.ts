import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database | undefined;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath =
      process.env.TEXTRACTOR_DB_PATH ??
      join(__dirname, "../../data/textractor.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
    db.pragma("synchronous = NORMAL");
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = undefined;
    migrationStatements = null;
  }
}

function prepareMigrationStatements() {
  const database = getDatabase();
  return {
    checkApplied: database.prepare(
      "SELECT 1 FROM _migrations WHERE name = ?"
    ),
    markApplied: database.prepare(
      "INSERT INTO _migrations (name) VALUES (?)"
    ),
  };
}

let migrationStatements: ReturnType<
  typeof prepareMigrationStatements
> | null = null;

function getMigrationStatements() {
  if (!migrationStatements) {
    migrationStatements = prepareMigrationStatements();
  }
  return migrationStatements;
}

export function runMigrations(): void {
  const database = getDatabase();

  database.exec(
    "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))"
  );

  const migrationFiles = [
    "001_create_extractions.sql",
    "002_create_settings.sql",
  ];

  for (const file of migrationFiles) {
    const alreadyApplied = getMigrationStatements().checkApplied.get(file);
    if (alreadyApplied) continue;

    const migration = readFileSync(
      join(__dirname, "migrations", file),
      "utf-8"
    );
    database.exec(migration);
    getMigrationStatements().markApplied.run(file);
  }
}
