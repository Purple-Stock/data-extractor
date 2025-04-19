"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TxtExporterProps {
  matchedData: any[]
  fileName?: string
}

export function TxtExporter({ matchedData, fileName = "Lista de Produtos ATUAIS.txt" }: TxtExporterProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTxtFile = () => {
    setIsGenerating(true)

    try {
      // Create header
      let content = "CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n"

      // Add data rows
      matchedData.forEach((row) => {
        // Map the data according to the specified format
        const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.EXTRAINF01 || ""};${row.EXTRAINF02 || ""};0`
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
      console.error("Error generating TXT file:", error)
      alert("Erro ao gerar arquivo TXT. Por favor, tente novamente.")
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
      <Download className="h-4 w-4" />
      {isGenerating ? "Gerando..." : "Exportar para TXT"}
    </Button>
  )
}
