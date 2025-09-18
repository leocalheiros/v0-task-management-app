"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2 } from "lucide-react"
import type { Task } from "@/lib/api"

interface EditTaskDialogProps {
  task: Task
  onTaskUpdated: (updatedTask: Task) => void
}

export function EditTaskDialog({ task, onTaskUpdated }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(task.name)
  const [status, setStatus] = useState<Task["status"]>(task.status)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const data = await response.json()
      onTaskUpdated(data.task)
      setOpen(false)
    } catch (error) {
      console.error("Error updating task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "open":
        return "text-blue-600"
      case "done":
        return "text-green-600"
      case "canceled":
        return "text-red-600"
      case "deleted":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusLabel = (status: Task["status"]) => {
    switch (status) {
      case "open":
        return "Aberta"
      case "done":
        return "Concluída"
      case "canceled":
        return "Cancelada"
      case "deleted":
        return "Excluída"
      default:
        return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Tarefa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da tarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: Task["status"]) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue>
                  <span className={getStatusColor(status)}>{getStatusLabel(status)}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">
                  <span className="text-blue-600">Aberta</span>
                </SelectItem>
                <SelectItem value="done">
                  <span className="text-green-600">Concluída</span>
                </SelectItem>
                <SelectItem value="canceled">
                  <span className="text-red-600">Cancelada</span>
                </SelectItem>
                <SelectItem value="deleted">
                  <span className="text-gray-600">Excluída</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
