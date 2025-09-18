import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/database"

const REPORT_PROMPT = `Usando as informações da tabela a seguir, gere um relatório em texto plano que informa quais pessoas estão trabalhando em quais tarefas. Uma pessoa está trabalhando em uma tarefa se ela tem horas registradas naquela tarefa com status ABERTO. Uma pessoa não está trabalhando em uma tarefa se não tiver horas lançadas em uma tarefa com status ABERTO. As informações devem ser coletadas a partir das próximas linhas:

*Informação dos apontamentos que virão de uma consulta SQL*

Exemplo:
id;name;created_at;updated_at;status;
1;teste;2025-09-18 18:51:41;2025-09-18 19:48:22;open

id;task_id;responsible;start_time;end_time;created_at;
1;1;teste;19:00;20:00;2025-09-18 18:51:49

`

export async function POST() {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables." },
        { status: 400 },
      )
    }

    const db = await initializeDatabase()

    // Get all tasks
    const tasks = await db.all(`
      SELECT id, name, created_at, updated_at, status
      FROM tasks
      ORDER BY created_at DESC
    `)

    // Get all time records
    const timeRecords = await db.all(`
      SELECT id, task_id, responsible, start_time, end_time, created_at
      FROM time_records
      ORDER BY created_at DESC
    `)

    // Format data for the AI prompt
    let dataForAI = REPORT_PROMPT + "\n\nTasks:\n"
    dataForAI += "id;name;created_at;updated_at;status;\n"

    tasks.forEach((task) => {
      dataForAI += `${task.id};${task.name};${task.created_at};${task.updated_at};${task.status};\n`
    })

    dataForAI += "\nTime Records:\n"
    dataForAI += "id;task_id;responsible;start_time;end_time;created_at;\n"

    timeRecords.forEach((record) => {
      dataForAI += `${record.id};${record.task_id};${record.responsible};${record.start_time};${record.end_time};${record.created_at};\n`
    })

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: dataForAI,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: "Failed to generate report", details: errorData }, { status: response.status })
    }

    const aiResponse = await response.json()
    const report = aiResponse.choices[0]?.message?.content || "No report generated"

    return NextResponse.json({
      report,
      tasksCount: tasks.length,
      timeRecordsCount: timeRecords.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
