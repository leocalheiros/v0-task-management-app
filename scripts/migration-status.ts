import { MigrationRunner } from "../lib/migrations"
import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(process.cwd(), "data", "mandala.db")
const db = new Database(dbPath)
db.pragma("foreign_keys = ON")

function showMigrationStatus() {
  console.log("📊 Database Migration Status\n")

  const migrationRunner = new MigrationRunner(db)
  const status = migrationRunner.getStatus()

  console.log(`Applied Migrations (${status.applied.length}):`)
  if (status.applied.length === 0) {
    console.log("   None")
  } else {
    status.applied.forEach((m) => {
      console.log(`   ✅ ${m.name}`)
    })
  }

  console.log(`\nPending Migrations (${status.pending.length}):`)
  if (status.pending.length === 0) {
    console.log("   None")
  } else {
    status.pending.forEach((m) => {
      console.log(`   ⏳ ${m.name}`)
    })
  }

  db.close()
}

showMigrationStatus()
