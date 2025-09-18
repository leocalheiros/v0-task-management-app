import { db } from "./database"
import type { Task, TimeRecord } from "./api"

// Server-side task functions
export const serverTaskApi = {
  // Get all tasks from database directly
  async getTasks(): Promise<Task[]> {
    const stmt = db.prepare(`
      SELECT id, name, created_at, updated_at, status 
      FROM tasks 
      ORDER BY created_at DESC
    `)
    return stmt.all() as Task[]
  },

  // Create a new task
  async createTask(name: string): Promise<Task> {
    const stmt = db.prepare(`
      INSERT INTO tasks (name, created_at, updated_at) 
      VALUES (?, datetime('now'), datetime('now'))
    `)
    const result = stmt.run(name)

    const getStmt = db.prepare("SELECT * FROM tasks WHERE id = ?")
    return getStmt.get(result.lastInsertRowid) as Task
  },

  // Get a specific task
  async getTask(id: number): Promise<Task | null> {
    const stmt = db.prepare("SELECT * FROM tasks WHERE id = ?")
    return stmt.get(id) as Task | null
  },

  // Update a task
  async updateTask(id: number, name: string): Promise<Task> {
    const stmt = db.prepare(`
      UPDATE tasks 
      SET name = ?, updated_at = datetime('now') 
      WHERE id = ?
    `)
    stmt.run(name, id)

    const getStmt = db.prepare("SELECT * FROM tasks WHERE id = ?")
    return getStmt.get(id) as Task
  },

  // Delete a task
  async deleteTask(id: number): Promise<void> {
    const stmt = db.prepare("DELETE FROM tasks WHERE id = ?")
    stmt.run(id)
  },
}

// Server-side time record functions
export const serverTimeRecordApi = {
  // Get time records (optionally filtered by task_id)
  async getTimeRecords(taskId?: number): Promise<TimeRecord[]> {
    let stmt
    let params: any[] = []

    if (taskId) {
      stmt = db.prepare(`
        SELECT tr.*, t.name as task_name
        FROM time_records tr
        LEFT JOIN tasks t ON tr.task_id = t.id
        WHERE tr.task_id = ?
        ORDER BY tr.created_at DESC
      `)
      params = [taskId]
    } else {
      stmt = db.prepare(`
        SELECT tr.*, t.name as task_name
        FROM time_records tr
        LEFT JOIN tasks t ON tr.task_id = t.id
        ORDER BY tr.created_at DESC
      `)
    }

    return stmt.all(...params) as TimeRecord[]
  },

  // Create a new time record
  async createTimeRecord(timeRecord: {
    task_id: number
    responsible: string
    start_time: string
    end_time: string
  }): Promise<TimeRecord> {
    const stmt = db.prepare(`
      INSERT INTO time_records (task_id, responsible, start_time, end_time, created_at) 
      VALUES (?, ?, ?, ?, datetime('now'))
    `)
    const result = stmt.run(timeRecord.task_id, timeRecord.responsible, timeRecord.start_time, timeRecord.end_time)

    const getStmt = db.prepare(`
      SELECT tr.*, t.name as task_name
      FROM time_records tr
      LEFT JOIN tasks t ON tr.task_id = t.id
      WHERE tr.id = ?
    `)
    return getStmt.get(result.lastInsertRowid) as TimeRecord
  },

  // Update a time record
  async updateTimeRecord(
    id: number,
    timeRecord: {
      responsible: string
      start_time: string
      end_time: string
    },
  ): Promise<TimeRecord> {
    const stmt = db.prepare(`
      UPDATE time_records 
      SET responsible = ?, start_time = ?, end_time = ?
      WHERE id = ?
    `)
    stmt.run(timeRecord.responsible, timeRecord.start_time, timeRecord.end_time, id)

    const getStmt = db.prepare(`
      SELECT tr.*, t.name as task_name
      FROM time_records tr
      LEFT JOIN tasks t ON tr.task_id = t.id
      WHERE tr.id = ?
    `)
    return getStmt.get(id) as TimeRecord
  },

  // Delete a time record
  async deleteTimeRecord(id: number): Promise<void> {
    const stmt = db.prepare("DELETE FROM time_records WHERE id = ?")
    stmt.run(id)
  },
}
