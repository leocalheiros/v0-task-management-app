export interface TimeRecord {
  id: number
  task_id: number
  responsible: string
  start_time: string
  end_time: string
  created_at: string
  task_name?: string
}

export interface Task {
  id: number
  name: string
  created_at: string
  updated_at: string
  timeRecords?: TimeRecord[]
}

// Task API functions
export const taskApi = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    const response = await fetch("/api/tasks")
    if (!response.ok) {
      throw new Error("Failed to fetch tasks")
    }
    const data = await response.json()
    return data.tasks
  },

  // Create a new task
  async createTask(name: string): Promise<Task> {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) {
      throw new Error("Failed to create task")
    }
    const data = await response.json()
    return data.task
  },

  // Get a specific task with time records
  async getTask(id: number): Promise<Task> {
    const response = await fetch(`/api/tasks/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch task")
    }
    const data = await response.json()
    return data.task
  },

  // Update a task
  async updateTask(id: number, name: string): Promise<Task> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) {
      throw new Error("Failed to update task")
    }
    const data = await response.json()
    return data.task
  },

  // Delete a task
  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete task")
    }
  },
}

// Time Record API functions
export const timeRecordApi = {
  // Get time records (optionally filtered by task_id)
  async getTimeRecords(taskId?: number): Promise<TimeRecord[]> {
    const url = taskId ? `/api/time-records?task_id=${taskId}` : "/api/time-records"
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Failed to fetch time records")
    }
    const data = await response.json()
    return data.timeRecords
  },

  // Create a new time record
  async createTimeRecord(timeRecord: {
    task_id: number
    responsible: string
    start_time: string
    end_time: string
  }): Promise<TimeRecord> {
    const response = await fetch("/api/time-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(timeRecord),
    })
    if (!response.ok) {
      throw new Error("Failed to create time record")
    }
    const data = await response.json()
    return data.timeRecord
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
    const response = await fetch(`/api/time-records/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(timeRecord),
    })
    if (!response.ok) {
      throw new Error("Failed to update time record")
    }
    const data = await response.json()
    return data.timeRecord
  },

  // Delete a time record
  async deleteTimeRecord(id: number): Promise<void> {
    const response = await fetch(`/api/time-records/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete time record")
    }
  },
}
