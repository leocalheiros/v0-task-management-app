import Database from "better-sqlite3"
import path from "path"

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

// Initialize database with schema
export function initializeDatabase() {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS time_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      responsible TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_time_records_task_id ON time_records(task_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_name ON tasks(name);
  `

  db.exec(createTablesSQL)
}

// Initialize database on import
initializeDatabase()

export default db
