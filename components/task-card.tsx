"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, User } from "lucide-react"
import type { TimeRecord } from "@/lib/api"

interface Task {
  id: number
  name: string
  timeRecords: TimeRecord[]
}

interface TaskCardProps {
  task: Task
  onAddTimeRecord: (taskId: number) => void
}

export function TaskCard({ task, onAddTimeRecord }: TaskCardProps) {
  const totalHours = task.timeRecords.reduce((total, record) => {
    if (record.start_time && record.end_time) {
      const start = new Date(`2000-01-01T${record.start_time}`)
      const end = new Date(`2000-01-01T${record.end_time}`)
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + diff
    }
    return total
  }, 0)

  return (
    <Card className="shadow-md rounded-xl border-gray-100 hover:shadow-lg transition-shadow duration-200 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-[#3F0C29] text-lg font-semibold leading-tight text-balance flex-1 min-w-0">
            {task.name}
          </CardTitle>
          <Badge variant="secondary" className="bg-[#3F0C29]/10 text-[#3F0C29] shrink-0">
            {totalHours.toFixed(1)}h
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            Registros de Horas
          </h4>

          {task.timeRecords.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Nenhum registro ainda</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {task.timeRecords.map((record) => (
                <div key={record.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0 flex-1">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="font-medium truncate">{record.responsible}</span>
                    </div>
                    <div className="text-xs text-gray-500 shrink-0">
                      {record.start_time && record.end_time && (
                        <>
                          {(() => {
                            const start = new Date(`2000-01-01T${record.start_time}`)
                            const end = new Date(`2000-01-01T${record.end_time}`)
                            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                            return `${diff.toFixed(1)}h`
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <span className="text-gray-600">
                      <strong>Início:</strong> {record.start_time || "--:--"}
                    </span>
                    <span className="text-gray-600">
                      <strong>Fim:</strong> {record.end_time || "--:--"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={() => onAddTimeRecord(task.id)}
          className="w-full bg-[#3F0C29] hover:bg-[#3F0C29]/90 text-white transition-colors duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Adicionar Registro de Hora</span>
          <span className="sm:hidden">Adicionar Registro</span>
        </Button>
      </CardContent>
    </Card>
  )
}
