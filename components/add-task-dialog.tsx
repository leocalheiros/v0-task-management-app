"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"

interface AddTaskDialogProps {
  onAddTask: (taskName: string) => Promise<void>
}

export function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [taskName, setTaskName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (taskName.trim() && !loading) {
      setLoading(true)
      try {
        await onAddTask(taskName.trim())
        setTaskName("")
        setOpen(false)
      } catch (error) {
        console.error("Error in dialog:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#3F0C29] hover:bg-[#3F0C29]/90 text-white transition-colors duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#3F0C29]">Adicionar Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskName">Nome da Tarefa</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Digite o nome da tarefa..."
              className="focus:border-[#3F0C29] focus:ring-[#3F0C29]"
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#3F0C29] hover:bg-[#3F0C29]/90" disabled={!taskName.trim() || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
