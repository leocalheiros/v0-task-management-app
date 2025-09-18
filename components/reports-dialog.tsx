"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Calendar, Users, Clock, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReportData {
  report: string
  tasksCount: number
  timeRecordsCount: number
  generatedAt: string
}

export function ReportsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const generateReport = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate report")
      }

      const data = await response.json()
      setReportData(data)

      toast({
        title: "Relatório gerado com sucesso!",
        description: "O relatório foi gerado usando IA.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      setError(errorMessage)

      toast({
        title: "Erro ao gerar relatório",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!reportData?.report) return

    try {
      await navigator.clipboard.writeText(reportData.report)
      setIsCopied(true)
      
      toast({
        title: "Relatório copiado!",
        description: "O texto do relatório foi copiado para a área de transferência.",
      })

      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o relatório. Tente selecionar e copiar manualmente.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <FileText className="h-4 w-4" />
          Gerar Relatório IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatório de Atividades com IA
          </DialogTitle>
          <DialogDescription>
            Gere um relatório inteligente sobre quem está trabalhando em quais tarefas usando IA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!reportData && !error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gerar Novo Relatório</CardTitle>
                <CardDescription>
                  Clique no botão abaixo para gerar um relatório usando inteligência artificial. O relatório analisará
                  todas as tarefas e registros de tempo para identificar quem está trabalhando em cada tarefa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={generateReport} disabled={isGenerating} className="w-full gap-2">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando relatório...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Gerar Relatório com IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Erro ao Gerar Relatório</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-4">{error}</p>
                <Button
                  onClick={generateReport}
                  disabled={isGenerating}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Tentando novamente...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Tentar Novamente
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {reportData && (
            <div className="space-y-4">
              {/* Report Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="flex items-center gap-2 p-4">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{reportData.tasksCount}</p>
                      <p className="text-sm text-muted-foreground">Tarefas</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-2 p-4">
                    <Clock className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{reportData.timeRecordsCount}</p>
                      <p className="text-sm text-muted-foreground">Registros</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-2 p-4">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Gerado em</p>
                      <p className="text-xs text-muted-foreground">{formatDate(reportData.generatedAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Report */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle>Relatório Gerado por IA</CardTitle>
                      <Badge variant="secondary">
                        OpenAI GPT-4.1
                      </Badge>
                    </div>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">{reportData.report}</pre>
                  </div>
                </CardContent>
              </Card>

              {/* Generate New Report Button */}
              <div className="flex justify-center">
                <Button
                  onClick={generateReport}
                  disabled={isGenerating}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando novo relatório...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Gerar Novo Relatório
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}