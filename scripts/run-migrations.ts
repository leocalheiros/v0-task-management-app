import { MigrationRunner } from "../lib/migrations"
import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(process.cwd(), "data", "mandala.db")
const db = new Database(dbPath)
db.pragma("foreign_keys = ON")

async function runMigrations() {
  console.log("🚀 Starting database migrations...")

  const migrationRunner = new MigrationRunner(db)

  // Show current status
  const status = migrationRunner.getStatus()
  console.log(`📊 Migration Status:`)
  console.log(`   Applied: ${status.applied.length}`)
  console.log(`   Pending: ${status.pending.length}`)

  if (status.pending.length > 0) {
    console.log(`\n📝 Pending migrations:`)
    status.pending.forEach((m) => console.log(`   - ${m.name}`))
  }

  // Run migrations
  await migrationRunner.runMigrations()

  console.log("✅ Database migrations completed!")
  db.close()
}

runMigrations().catch((error) => {
  console.error("❌ Migration failed:", error)
  process.exit(1)
})
