import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export interface TimeRecord {
  id: number
  task_id: number
  responsible: string
  start_time: string
  end_time: string
  created_at: string
}

// GET /api/time-records - List all time records (optionally filtered by task_id)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("task_id")

    let stmt
    let records

    if (taskId) {
      const taskIdNum = Number.parseInt(taskId)
      if (isNaN(taskIdNum)) {
        return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
      }

      stmt = db.prepare(`
        SELECT tr.*, t.name as task_name 
        FROM time_records tr
        JOIN tasks t ON tr.task_id = t.id
        WHERE tr.task_id = ?
        ORDER BY tr.created_at DESC
      `)
      records = stmt.all(taskIdNum)
    } else {
      stmt = db.prepare(`
        SELECT tr.*, t.name as task_name 
        FROM time_records tr
        JOIN tasks t ON tr.task_id = t.id
        ORDER BY tr.created_at DESC
      `)
      records = stmt.all()
    }

    return NextResponse.json({ timeRecords: records })
  } catch (error) {
    console.error("Error fetching time records:", error)
    return NextResponse.json({ error: "Failed to fetch time records" }, { status: 500 })
  }
}

// POST /api/time-records - Create a new time record
export async function POST(request: NextRequest) {
  try {
    const { task_id, responsible, start_time, end_time } = await request.json()

    // Validation
    if (!task_id || !responsible || !start_time || !end_time) {
      return NextResponse.json(
        { error: "All fields are required: task_id, responsible, start_time, end_time" },
        { status: 400 },
      )
    }

    const taskIdNum = Number.parseInt(task_id)
    if (isNaN(taskIdNum)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    // Check if task exists
    const taskStmt = db.prepare("SELECT id FROM tasks WHERE id = ?")
    const task = taskStmt.get(taskIdNum)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Validate time format (basic validation)
    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return NextResponse.json({ error: "Invalid time format. Use HH:MM format" }, { status: 400 })
    }

    const stmt = db.prepare(`
      INSERT INTO time_records (task_id, responsible, start_time, end_time) 
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(taskIdNum, responsible.trim(), start_time, end_time)

    // Get the created time record with task name
    const getStmt = db.prepare(`
      SELECT tr.*, t.name as task_name 
      FROM time_records tr
      JOIN tasks t ON tr.task_id = t.id
      WHERE tr.id = ?
    `)
    const timeRecord = getStmt.get(result.lastInsertRowid)

    return NextResponse.json({ timeRecord }, { status: 201 })
  } catch (error) {
    console.error("Error creating time record:", error)
    return NextResponse.json({ error: "Failed to create time record" }, { status: 500 })
  }
}
