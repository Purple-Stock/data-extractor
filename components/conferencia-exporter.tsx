"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConferenciaExporterProps {
  matchedData: any[]
  fileName?: string
}

export function ConferenciaExporter({ matchedData, fileName = "Conferência Ok.txt" }: ConferenciaExporterProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTxtFile = () => {
    setIsGenerating(true)

    try {
      // Create header - note the spaces in "DESCRI  O"
      let content = "CODIGO;DESCRI  O;QTDA;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n"

      // Add data rows
      matchedData.forEach((row) => {
        const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.QUANTIDADE || "0"};${row.EXTRAINF01 || ""};${row.EXTRAINF02 || ""};0`
        content += line + "\n"
      })

      // Create blob and download
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating conferência file:", error)
      alert("Erro ao gerar arquivo de conferência. Por favor, tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={generateTxtFile}
      disabled={isGenerating || matchedData.length === 0}
      variant="outline"
      className="flex items-center gap-2"
    >
      <CheckCircle className="h-4 w-4" />
      {isGenerating ? "Gerando..." : "Exportar Conferência"}
    </Button>
  )
}
