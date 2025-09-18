import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

// GET /api/tasks/[id] - Get a specific task with time records
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = Number.parseInt(params.id)

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    // Get task
    const taskStmt = db.prepare("SELECT * FROM tasks WHERE id = ?")
    const task = taskStmt.get(taskId)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Get time records for this task
    const recordsStmt = db.prepare(`
      SELECT * FROM time_records 
      WHERE task_id = ? 
      ORDER BY created_at DESC
    `)
    const timeRecords = recordsStmt.all(taskId)

    return NextResponse.json({
      task: { ...task, timeRecords },
    })
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = Number.parseInt(params.id)
    const { name, status } = await request.json()

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const updates: string[] = []
    const values: any[] = []

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Task name must be a non-empty string" }, { status: 400 })
      }
      updates.push("name = ?")
      values.push(name.trim())
    }

    if (status !== undefined) {
      if (!["open", "done", "deleted", "canceled"].includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
      }
      updates.push("status = ?")
      values.push(status)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updates.push("updated_at = CURRENT_TIMESTAMP")
    values.push(taskId)

    const stmt = db.prepare(`
      UPDATE tasks 
      SET ${updates.join(", ")} 
      WHERE id = ?
    `)

    const result = stmt.run(...values)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Get updated task
    const getStmt = db.prepare("SELECT * FROM tasks WHERE id = ?")
    const task = getStmt.get(taskId)

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = Number.parseInt(params.id)

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const stmt = db.prepare("DELETE FROM tasks WHERE id = ?")
    const result = stmt.run(taskId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
