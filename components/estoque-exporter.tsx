"use client"

import { useState } from "react"
import { Database } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EstoqueExporterProps {
  matchedData: any[]
  fileName?: string
}

export function EstoqueExporter({ matchedData, fileName = "estoque_list.txt" }: EstoqueExporterProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTxtFile = () => {
    setIsGenerating(true)

    try {
      // Create header
      let content = "CODIGO;DESCRIÇÃO;QTDA;VALOR UNIT;EXTRAINF01\n"

      // Add data rows
      matchedData.forEach((row) => {
        // Format VALORUNIT to have exactly 2 decimal places
        let valorUnit = "0.00"
        if (row.VALORUNIT) {
          // Convert to number and format with 2 decimal places
          const numValue = Number.parseFloat(String(row.VALORUNIT).replace(",", "."))
          if (!isNaN(numValue)) {
            valorUnit = numValue.toFixed(2)
          }
        }

        const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.QUANTIDADE || "0"};${valorUnit};${row.EXTRAINF01 || ""}`
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
      console.error("Error generating estoque list file:", error)
      alert("Erro ao gerar arquivo de estoque. Por favor, tente novamente.")
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
      <Database className="h-4 w-4" />
      {isGenerating ? "Gerando..." : "Exportar Estoque"}
    </Button>
  )
}
