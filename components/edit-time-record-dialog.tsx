"use client"

import type React from "react"

import type { ReactElement } from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, User, Trash2 } from "lucide-react"
import type { TimeRecord } from "@/lib/api"

interface EditTimeRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeRecord: TimeRecord | null
  onUpdateTimeRecord: (id: number, record: { responsible: string; start_time: string; end_time: string }) => void
  onDeleteTimeRecord: (id: number) => void
}

export function EditTimeRecordDialog({
  open,
  onOpenChange,
  timeRecord,
  onUpdateTimeRecord,
  onDeleteTimeRecord,
}: EditTimeRecordDialogProps): ReactElement | null {
  const [responsible, setResponsible] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  // Update form when timeRecord changes
  useState(() => {
    if (timeRecord) {
      setResponsible(timeRecord.responsible)
      setStartTime(timeRecord.start_time)
      setEndTime(timeRecord.end_time)
    }
  }, [timeRecord])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (timeRecord && responsible.trim() && startTime && endTime) {
      onUpdateTimeRecord(timeRecord.id, {
        responsible: responsible.trim(),
        start_time: startTime,
        end_time: endTime,
      })
      onOpenChange(false)
    }
  }

  const handleDelete = () => {
    if (timeRecord && confirm("Tem certeza que deseja excluir este registro de hora?")) {
      onDeleteTimeRecord(timeRecord.id)
      onOpenChange(false)
    }
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toTimeString().slice(0, 5) // HH:MM format
  }

  const setCurrentStartTime = () => {
    setStartTime(getCurrentTime())
  }

  const setCurrentEndTime = () => {
    setEndTime(getCurrentTime())
  }

  if (!timeRecord) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#3F0C29] flex items-center gap-2 text-balance">
            <Clock className="h-5 w-5 shrink-0" />
            Editar Registro de Hora
          </DialogTitle>
          <p className="text-sm text-gray-600 text-balance">Tarefa: {timeRecord.task_name}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="responsible" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Responsável
            </Label>
            <Input
              id="responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Nome do responsável..."
              className="focus:border-[#3F0C29] focus:ring-[#3F0C29]"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora Inicial</Label>
              <div className="flex gap-2">
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="focus:border-[#3F0C29] focus:ring-[#3F0C29] flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setCurrentStartTime}
                  className="px-2 text-xs shrink-0 bg-transparent"
                >
                  Agora
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Hora Final</Label>
              <div className="flex gap-2">
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="focus:border-[#3F0C29] focus:ring-[#3F0C29] flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setCurrentEndTime}
                  className="px-2 text-xs shrink-0 bg-transparent"
                >
                  Agora
                </Button>
              </div>
            </div>
          </div>

          {/* Duration Preview */}
          {startTime && endTime && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-sm text-gray-600 text-balance">
                <strong>Duração:</strong> {(() => {
                  const start = new Date(`2000-01-01T${startTime}`)
                  const end = new Date(`2000-01-01T${endTime}`)
                  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                  return diff > 0 ? `${diff.toFixed(1)} horas` : "Hora final deve ser posterior à inicial"
                })()}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2 order-3 sm:order-1"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>

            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#3F0C29] hover:bg-[#3F0C29]/90 order-1 sm:order-2"
                disabled={!responsible.trim() || !startTime || !endTime}
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
