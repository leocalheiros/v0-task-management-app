import type Database from "better-sqlite3"
import fs from "fs"
import path from "path"

export interface Migration {
  id: number
  name: string
  up: string
  down?: string
  applied_at?: string
}

export class MigrationRunner {
  private db: Database.Database
  private migrationsPath: string

  constructor(db: Database.Database, migrationsPath = "migrations") {
    this.db = db
    this.migrationsPath = migrationsPath
    this.initializeMigrationsTable()
  }

  private initializeMigrationsTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)
  }

  private getAppliedMigrations(): Set<string> {
    const stmt = this.db.prepare("SELECT name FROM migrations ORDER BY id")
    const applied = stmt.all() as { name: string }[]
    return new Set(applied.map((m) => m.name))
  }

  private getMigrationFiles(): Migration[] {
    const migrationsDir = path.join(process.cwd(), this.migrationsPath)

    if (!fs.existsSync(migrationsDir)) {
      console.log(`[v0] Migrations directory ${migrationsDir} does not exist, creating...`)
      fs.mkdirSync(migrationsDir, { recursive: true })
      return []
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    return files.map((file) => {
      const filePath = path.join(migrationsDir, file)
      const content = fs.readFileSync(filePath, "utf-8")
      const [, idStr, name] = file.match(/^(\d+)_(.+)\.sql$/) || []

      if (!idStr || !name) {
        throw new Error(`Invalid migration filename: ${file}. Expected format: 001_migration_name.sql`)
      }

      return {
        id: Number.parseInt(idStr),
        name: file,
        up: content,
      }
    })
  }

  async runMigrations(): Promise<void> {
    const appliedMigrations = this.getAppliedMigrations()
    const migrationFiles = this.getMigrationFiles()

    console.log(`[v0] Found ${migrationFiles.length} migration files`)
    console.log(`[v0] ${appliedMigrations.size} migrations already applied`)

    const pendingMigrations = migrationFiles.filter((migration) => !appliedMigrations.has(migration.name))

    if (pendingMigrations.length === 0) {
      console.log("[v0] No pending migrations")
      return
    }

    console.log(`[v0] Running ${pendingMigrations.length} pending migrations...`)

    const insertMigration = this.db.prepare("INSERT INTO migrations (id, name) VALUES (?, ?)")

    for (const migration of pendingMigrations) {
      console.log(`[v0] Running migration: ${migration.name}`)

      try {
        this.db.transaction(() => {
          this.db.exec(migration.up)
          insertMigration.run(migration.id, migration.name)
        })()

        console.log(`[v0] ✓ Migration ${migration.name} completed`)
      } catch (error) {
        console.error(`[v0] ✗ Migration ${migration.name} failed:`, error)
        throw error
      }
    }

    console.log("[v0] All migrations completed successfully")
  }

  getStatus(): { applied: Migration[]; pending: Migration[] } {
    const appliedMigrations = this.getAppliedMigrations()
    const migrationFiles = this.getMigrationFiles()

    const applied = migrationFiles.filter((m) => appliedMigrations.has(m.name))
    const pending = migrationFiles.filter((m) => !appliedMigrations.has(m.name))

    return { applied, pending }
  }
}
