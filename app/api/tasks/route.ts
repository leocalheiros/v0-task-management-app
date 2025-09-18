import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export interface Task {
  id: number
  name: string
  status: "open" | "done" | "deleted" | "canceled"
  created_at: string
  updated_at: string
}

// GET /api/tasks - List all tasks
export async function GET() {
  try {
    const stmt = db.prepare("SELECT * FROM tasks WHERE status != 'deleted' ORDER BY created_at DESC")
    const tasks = stmt.all() as Task[]

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Task name is required" }, { status: 400 })
    }

    const stmt = db.prepare(`
      INSERT INTO tasks (name, status) 
      VALUES (?, 'open')
    `)

    const result = stmt.run(name.trim())

    // Get the created task
    const getStmt = db.prepare("SELECT * FROM tasks WHERE id = ?")
    const task = getStmt.get(result.lastInsertRowid) as Task

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
