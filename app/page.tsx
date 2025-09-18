"use client"

import { useState, useEffect } from "react"
import { Menu, Search, User, X, Home, Clock, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TaskCard } from "@/components/task-card"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { AddTimeRecordDialog } from "@/components/add-time-record-dialog"
import { taskApi, timeRecordApi, type Task, type TimeRecord } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface TimeRecordForm {
  responsible: string
  startTime: string
  endTime: string
}

interface TaskWithRecords extends Task {
  timeRecords: TimeRecord[]
}

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [tasks, setTasks] = useState<TaskWithRecords[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [timeRecordDialog, setTimeRecordDialog] = useState<{
    open: boolean
    taskId: number | null
    taskName: string
  }>({
    open: false,
    taskId: null,
    taskName: "",
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedTasks = await taskApi.getTasks()

      const tasksWithRecords = await Promise.all(
        fetchedTasks.map(async (task) => {
          try {
            const timeRecords = await timeRecordApi.getTimeRecords(task.id)
            return { ...task, timeRecords }
          } catch (error) {
            console.error(`Error loading time records for task ${task.id}:`, error)
            return { ...task, timeRecords: [] }
          }
        }),
      )

      setTasks(tasksWithRecords)
    } catch (error) {
      console.error("Error loading tasks:", error)
      setError("Erro ao carregar tarefas. Tente novamente.")
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as tarefas. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const addTask = async (taskName: string) => {
    try {
      const newTask = await taskApi.createTask(taskName)
      const taskWithRecords = { ...newTask, timeRecords: [] }
      setTasks([taskWithRecords, ...tasks])
      toast({
        variant: "success",
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar a tarefa. Tente novamente.",
      })
    }
  }

  const addTimeRecord = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setTimeRecordDialog({
        open: true,
        taskId,
        taskName: task.name,
      })
    }
  }

  const handleAddTimeRecord = async (record: TimeRecordForm) => {
    if (timeRecordDialog.taskId) {
      try {
        const newRecord = await timeRecordApi.createTimeRecord({
          task_id: timeRecordDialog.taskId,
          responsible: record.responsible,
          start_time: record.startTime,
          end_time: record.endTime,
        })

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === timeRecordDialog.taskId ? { ...task, timeRecords: [newRecord, ...task.timeRecords] } : task,
          ),
        )

        toast({
          variant: "success",
          title: "Sucesso",
          description: "Registro de hora adicionado com sucesso!",
        })
      } catch (error) {
        console.error("Error creating time record:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível adicionar o registro de hora. Tente novamente.",
        })
      }
    }
  }

  const filteredTasks = tasks.filter((task) => task.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F0C29] mx-auto mb-4"></div>
          <p className="text-[#3F0C29] font-medium">Carregando tarefas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadTasks} className="bg-[#3F0C29] hover:bg-[#3F0C29]/90">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#3F0C29] text-white px-4 py-3 flex items-center justify-between relative z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="text-white hover:bg-white/10 transition-colors duration-200"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold tracking-wide">MANDALA</h1>
        </div>

        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-white/20 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </header>

      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#3F0C29]">Menu</h2>
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-[#3F0C29] hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-[#3F0C29] hover:bg-[#3F0C29]/10 transition-colors duration-200"
              >
                <Home className="mr-3 h-5 w-5" />
                Home
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-[#3F0C29] hover:bg-[#3F0C29]/10 transition-colors duration-200"
              >
                <Clock className="mr-3 h-5 w-5" />
                Hora Task x Ponto
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-[#3F0C29] hover:bg-[#3F0C29]/10 transition-colors duration-200"
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Pesquisa de Satisfação
              </Button>
            </li>
          </ul>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300" onClick={toggleMenu} />
      )}

      <main className="p-4 md:p-6 pb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-[#3F0C29] focus:ring-[#3F0C29] transition-colors duration-200"
          />
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#3F0C29] text-balance">Gestão de Tarefas</h2>
            <AddTaskDialog onAddTask={addTask} />
          </div>

          {filteredTasks.length === 0 ? (
            <Card className="shadow-md rounded-xl border-gray-100">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 text-lg text-balance">
                  {searchTerm ? "Nenhuma tarefa encontrada." : "Nenhuma tarefa criada ainda."}
                </p>
                <p className="text-gray-400 text-sm mt-2 text-balance">
                  {!searchTerm && 'Clique em "Nova Tarefa" para começar.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onAddTimeRecord={addTimeRecord} />
              ))}
            </div>
          )}
        </div>

        <Card className="shadow-md rounded-xl border-gray-100 mt-8">
          <CardHeader>
            <CardTitle className="text-[#3F0C29] text-lg">Recente Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-balance">Seus projetos mais recentes aparecerão aqui.</p>
          </CardContent>
        </Card>
      </main>

      <AddTimeRecordDialog
        open={timeRecordDialog.open}
        onOpenChange={(open) => setTimeRecordDialog((prev) => ({ ...prev, open }))}
        onAddTimeRecord={handleAddTimeRecord}
        taskName={timeRecordDialog.taskName}
      />
    </div>
  )
}
