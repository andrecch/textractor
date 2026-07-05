import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = join(__dirname, "../../data/textractor.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
    db.pragma("synchronous = NORMAL");
  }
  return db;
}

export function runMigrations(): void {
  const database = getDatabase();
  const migration = readFileSync(
    join(__dirname, "migrations/001_create_extractions.sql"),
    "utf-8"
  );
  database.exec(migration);
}
