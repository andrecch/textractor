import { getDatabase } from "../db/database.js";

const API_KEY_NAME = "nvidia_api_key";

function prepareSettingsStatements() {
  const db = getDatabase();
  return {
    getKey: db.prepare("SELECT value FROM app_settings WHERE key = ?"),
    setKey: db.prepare(
      "INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
    ),
    clearKey: db.prepare("DELETE FROM app_settings WHERE key = ?"),
  };
}

let settingsStatements: ReturnType<
  typeof prepareSettingsStatements
> | null = null;

function getSettingsStatements() {
  if (!settingsStatements) {
    settingsStatements = prepareSettingsStatements();
  }
  return settingsStatements;
}

export function getUserApiKey(): string | null {
  try {
    const row = getSettingsStatements().getKey.get(API_KEY_NAME) as
      | { value: string }
      | undefined;
    return row?.value ?? null;
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("no such table: app_settings")
    ) {
      return null;
    }
    throw err;
  }
}

export function setUserApiKey(value: string): void {
  getSettingsStatements().setKey.run(API_KEY_NAME, value);
}

export function clearUserApiKey(): void {
  getSettingsStatements().clearKey.run(API_KEY_NAME);
}

export function resolveApiKey(): string | null {
  return getUserApiKey() ?? process.env.NVIDIA_API_KEY ?? null;
}

export function getApiKeySource(): "user" | "server" | "none" {
  if (getUserApiKey()) return "user";
  if (process.env.NVIDIA_API_KEY) return "server";
  return "none";
}
