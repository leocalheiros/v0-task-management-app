"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, User, Edit } from "lucide-react"
import { EditTaskDialog } from "./edit-task-dialog"
import { EditTimeRecordDialog } from "./edit-time-record-dialog"
import { useState } from "react"
import type { Task, TimeRecord } from "@/lib/api"

interface TaskCardProps {
  task: Task
  onAddTimeRecord: (taskId: number) => void
  onTaskUpdated: (updatedTask: Task) => void
  onTimeRecordUpdated: (timeRecord: TimeRecord) => void
  onTimeRecordDeleted: (timeRecordId: number) => void
}

export function TaskCard({
  task,
  onAddTimeRecord,
  onTaskUpdated,
  onTimeRecordUpdated,
  onTimeRecordDeleted,
}: TaskCardProps) {
  const [editTimeRecordDialog, setEditTimeRecordDialog] = useState<{
    open: boolean
    timeRecord: TimeRecord | null
  }>({
    open: false,
    timeRecord: null,
  })

  const totalHours =
    task.timeRecords?.reduce((total, record) => {
      if (record.start_time && record.end_time) {
        const start = new Date(`2000-01-01T${record.start_time}`)
        const end = new Date(`2000-01-01T${record.end_time}`)
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return total + diff
      }
      return total
    }, 0) || 0

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Aberta
          </Badge>
        )
      case "done":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Concluída
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Cancelada
          </Badge>
        )
      case "deleted":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Excluída
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleEditTimeRecord = (timeRecord: TimeRecord) => {
    setEditTimeRecordDialog({
      open: true,
      timeRecord,
    })
  }

  const handleUpdateTimeRecord = async (
    id: number,
    updates: { responsible: string; start_time: string; end_time: string },
  ) => {
    try {
      const response = await fetch(`/api/time-records/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update time record")
      }

      const data = await response.json()
      onTimeRecordUpdated(data.timeRecord)
    } catch (error) {
      console.error("Error updating time record:", error)
      alert("Erro ao atualizar registro de hora")
    }
  }

  const handleDeleteTimeRecord = async (id: number) => {
    try {
      const response = await fetch(`/api/time-records/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete time record")
      }

      onTimeRecordDeleted(id)
    } catch (error) {
      console.error("Error deleting time record:", error)
      alert("Erro ao excluir registro de hora")
    }
  }

  return (
    <>
      <Card className="shadow-md rounded-xl border-gray-100 hover:shadow-lg transition-shadow duration-200 h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-[#3F0C29] text-lg font-semibold leading-tight text-balance flex-1 min-w-0">
              {task.name}
            </CardTitle>
            <div className="flex flex-col gap-2 shrink-0">
              <Badge variant="secondary" className="bg-[#3F0C29]/10 text-[#3F0C29]">
                {totalHours.toFixed(1)}h
              </Badge>
              {getStatusBadge(task.status)}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <EditTaskDialog task={task} onTaskUpdated={onTaskUpdated} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              Registros de Horas
            </h4>

            {!task.timeRecords || task.timeRecords.length === 0 ? (
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
                      <div className="flex items-center gap-2">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTimeRecord(record)}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
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
            disabled={task.status === "deleted"}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Adicionar Registro de Hora</span>
            <span className="sm:hidden">Adicionar Registro</span>
          </Button>
        </CardContent>
      </Card>

      <EditTimeRecordDialog
        open={editTimeRecordDialog.open}
        onOpenChange={(open) => setEditTimeRecordDialog({ open, timeRecord: null })}
        timeRecord={editTimeRecordDialog.timeRecord}
        onUpdateTimeRecord={handleUpdateTimeRecord}
        onDeleteTimeRecord={handleDeleteTimeRecord}
      />
    </>
  )
}
