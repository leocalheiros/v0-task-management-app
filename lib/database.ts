import Database from "better-sqlite3"
import path from "path"
import { MigrationRunner } from "./migrations"

const dbPath = path.join(process.cwd(), "data", "mandala.db")

// Ensure data directory exists
import fs from "fs"
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable foreign keys
db.pragma("foreign_keys = ON")

export async function initializeDatabase() {
  const migrationRunner = new MigrationRunner(db)
  await migrationRunner.runMigrations()
}

// Initialize database on import
initializeDatabase().catch(console.error)

export default db
