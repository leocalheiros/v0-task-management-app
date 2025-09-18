import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

// GET /api/time-records/[id] - Get a specific time record
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recordId = Number.parseInt(params.id)

    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid time record ID" }, { status: 400 })
    }

    const stmt = db.prepare(`
      SELECT tr.*, t.name as task_name 
      FROM time_records tr
      JOIN tasks t ON tr.task_id = t.id
      WHERE tr.id = ?
    `)
    const timeRecord = stmt.get(recordId)

    if (!timeRecord) {
      return NextResponse.json({ error: "Time record not found" }, { status: 404 })
    }

    return NextResponse.json({ timeRecord })
  } catch (error) {
    console.error("Error fetching time record:", error)
    return NextResponse.json({ error: "Failed to fetch time record" }, { status: 500 })
  }
}

// PUT /api/time-records/[id] - Update a time record
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recordId = Number.parseInt(params.id)
    const { responsible, start_time, end_time } = await request.json()

    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid time record ID" }, { status: 400 })
    }

    if (!responsible || !start_time || !end_time) {
      return NextResponse.json({ error: "All fields are required: responsible, start_time, end_time" }, { status: 400 })
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return NextResponse.json({ error: "Invalid time format. Use HH:MM format" }, { status: 400 })
    }

    const stmt = db.prepare(`
      UPDATE time_records 
      SET responsible = ?, start_time = ?, end_time = ?
      WHERE id = ?
    `)

    const result = stmt.run(responsible.trim(), start_time, end_time, recordId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Time record not found" }, { status: 404 })
    }

    // Get updated time record
    const getStmt = db.prepare(`
      SELECT tr.*, t.name as task_name 
      FROM time_records tr
      JOIN tasks t ON tr.task_id = t.id
      WHERE tr.id = ?
    `)
    const timeRecord = getStmt.get(recordId)

    return NextResponse.json({ timeRecord })
  } catch (error) {
    console.error("Error updating time record:", error)
    return NextResponse.json({ error: "Failed to update time record" }, { status: 500 })
  }
}

// DELETE /api/time-records/[id] - Delete a time record
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recordId = Number.parseInt(params.id)

    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid time record ID" }, { status: 400 })
    }

    const stmt = db.prepare("DELETE FROM time_records WHERE id = ?")
    const result = stmt.run(recordId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Time record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Time record deleted successfully" })
  } catch (error) {
    console.error("Error deleting time record:", error)
    return NextResponse.json({ error: "Failed to delete time record" }, { status: 500 })
  }
}
