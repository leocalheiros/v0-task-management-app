import type React from "react"
import type { Metadata } from "next"
import ClientComponent from "./clientComponent"
import "./globals.css"

export const metadata: Metadata = {
  title: "MANDALA - Gestão de Tarefas",
  description: "Sistema de gestão de tarefas com apontamento de horas",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientComponent>{children}</ClientComponent>
}
