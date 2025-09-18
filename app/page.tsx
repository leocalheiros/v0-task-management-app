import { ClientHomePage } from "@/components/client-home-page"
import { serverTaskApi, serverTimeRecordApi } from "@/lib/server-api"
import type { Task, TimeRecord } from "@/lib/api"

interface TaskWithRecords extends Task {
  timeRecords: TimeRecord[]
}

async function getTasks(): Promise<TaskWithRecords[]> {
  try {
    const tasks = await serverTaskApi.getTasks()

    const tasksWithRecords = await Promise.all(
      tasks.map(async (task) => {
        try {
          const timeRecords = await serverTimeRecordApi.getTimeRecords(task.id)
          return { ...task, timeRecords }
        } catch (error) {
          console.error(`Error loading time records for task ${task.id}:`, error)
          return { ...task, timeRecords: [] }
        }
      }),
    )

    return tasksWithRecords
  } catch (error) {
    console.error("Error loading tasks:", error)
    return []
  }
}

export default async function HomePage() {
  let initialTasks: TaskWithRecords[] = []
  let error: string | null = null

  try {
    initialTasks = await getTasks()
  } catch (err) {
    console.error("Failed to load initial tasks:", err)
    error = "Erro ao carregar dados iniciais"
  }

  return <ClientHomePage initialTasks={initialTasks} initialError={error} />
}
