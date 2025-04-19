"use client"

import { useState } from "react"
import { Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import JSZip from "jszip"

interface FilePreviewProps {
  matchedData: any[]
}

export function FilePreview({ matchedData }: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState("estoque")
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate preview data for each file type
  const estoquePreview = matchedData.slice(0, 5).map((row) => {
    // Format VALORUNIT to have exactly 2 decimal places
    let valorUnit = "0.00"
    if (row.VALORUNIT) {
      const numValue = Number.parseFloat(String(row.VALORUNIT).replace(",", "."))
      if (!isNaN(numValue)) {
        valorUnit = numValue.toFixed(2)
      }
    }

    return {
      CODIGO: row["Cód. Auxiliar"] || "",
      QTDA: row.QUANTIDADE || "0",
      "VALOR UNIT": valorUnit,
    }
  })

  const conferenciaPreview = matchedData.slice(0, 5).map((row) => {
    return {
      CODIGO: row["Cód. Auxiliar"] || "",
      "DESCRI  O": row["Descrição_1"] || "",
      QTDA: row.QUANTIDADE || "0",
      EXTRAINF01: row.EXTRAINF01 || "",
      EXTRAINF02: row.EXTRAINF02 || "",
      REQEXTRADATA: "0",
    }
  })

  const produtosPreview = matchedData.slice(0, 5).map((row) => {
    return {
      CODE: row["Cód. Auxiliar"] || "",
      DESCRIPTION: row["Descrição_1"] || "",
      EXTRAINF01: row.EXTRAINF01 || "",
      EXTRAINF02: row.EXTRAINF02 || "",
      REQEXTRADATA: "0",
    }
  })

  // Generate file content functions
  const generateEstoqueContent = () => {
    let content = "CODIGO;QTDA;VALOR UNIT\n"
    matchedData.forEach((row) => {
      let valorUnit = "0.00"
      if (row.VALORUNIT) {
        const numValue = Number.parseFloat(String(row.VALORUNIT).replace(",", "."))
        if (!isNaN(numValue)) {
          valorUnit = numValue.toFixed(2)
        }
      }
      const line = `${row["Cód. Auxiliar"] || ""};${row.QUANTIDADE || "0"};${valorUnit}`
      content += line + "\n"
    })
    return content
  }

  const generateConferenciaContent = () => {
    let content = "CODIGO;DESCRI  O;QTDA;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n"
    matchedData.forEach((row) => {
      const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.QUANTIDADE || "0"};${row.EXTRAINF01 || ""};${row.EXTRAINF02 || ""};0`
      content += line + "\n"
    })
    return content
  }

  const generateProdutosContent = () => {
    let content = "CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n"
    matchedData.forEach((row) => {
      const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.EXTRAINF01 || ""};${row.EXTRAINF02 || ""};0`
      content += line + "\n"
    })
    return content
  }

  // Download individual file
  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Download all files as ZIP
  const downloadAllFiles = async () => {
    setIsGenerating(true)
    try {
      const zip = new JSZip()

      // Add each file to the zip
      zip.file("estoque_list.txt", generateEstoqueContent())
      zip.file("Conferência Ok.txt", generateConferenciaContent())
      zip.file("Lista de Produtos ATUAIS.txt", generateProdutosContent())

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" })

      // Download the zip file
      const url = URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = "arquivos_exportados.zip"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating ZIP file:", error)
      alert("Erro ao gerar arquivo ZIP. Por favor, tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Prévia dos Arquivos:</CardTitle>
          <CardDescription>Visualize e baixe os arquivos gerados a partir dos dados combinados</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="estoque">Estoque lista.txt</TabsTrigger>
              <TabsTrigger value="conferencia">Conferência Ok.txt</TabsTrigger>
              <TabsTrigger value="produtos">Lista de Produtos ATUAIS.txt</TabsTrigger>
            </TabsList>

            <TabsContent value="estoque" className="border rounded-md p-4">
              <div className="text-sm font-medium mb-2">Mostrando 5 de {matchedData.length} linhas</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="border px-4 py-2 text-left">CODIGO</th>
                      <th className="border px-4 py-2 text-left">QTDA</th>
                      <th className="border px-4 py-2 text-left">VALOR UNIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estoquePreview.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="border px-4 py-2">{row.CODIGO}</td>
                        <td className="border px-4 py-2">{row.QTDA}</td>
                        <td className="border px-4 py-2">{row["VALOR UNIT"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="conferencia" className="border rounded-md p-4">
              <div className="text-sm font-medium mb-2">Mostrando 5 de {matchedData.length} linhas</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="border px-4 py-2 text-left">CODIGO</th>
                      <th className="border px-4 py-2 text-left">DESCRI O</th>
                      <th className="border px-4 py-2 text-left">QTDA</th>
                      <th className="border px-4 py-2 text-left">EXTRAINF01</th>
                      <th className="border px-4 py-2 text-left">EXTRAINF02</th>
                      <th className="border px-4 py-2 text-left">REQEXTRADATA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conferenciaPreview.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="border px-4 py-2">{row.CODIGO}</td>
                        <td className="border px-4 py-2">{row["DESCRI  O"]}</td>
                        <td className="border px-4 py-2">{row.QTDA}</td>
                        <td className="border px-4 py-2">{row.EXTRAINF01}</td>
                        <td className="border px-4 py-2">{row.EXTRAINF02}</td>
                        <td className="border px-4 py-2">{row.REQEXTRADATA}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="produtos" className="border rounded-md p-4">
              <div className="text-sm font-medium mb-2">Mostrando 5 de {matchedData.length} linhas</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="border px-4 py-2 text-left">CODE</th>
                      <th className="border px-4 py-2 text-left">DESCRIPTION</th>
                      <th className="border px-4 py-2 text-left">EXTRAINF01</th>
                      <th className="border px-4 py-2 text-left">EXTRAINF02</th>
                      <th className="border px-4 py-2 text-left">REQEXTRADATA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosPreview.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="border px-4 py-2">{row.CODE}</td>
                        <td className="border px-4 py-2">{row.DESCRIPTION}</td>
                        <td className="border px-4 py-2">{row.EXTRAINF01}</td>
                        <td className="border px-4 py-2">{row.EXTRAINF02}</td>
                        <td className="border px-4 py-2">{row.REQEXTRADATA}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Arquivos Gerados:</h3>
            <Button
              onClick={downloadAllFiles}
              className="w-full mb-4 flex items-center justify-center gap-2"
              disabled={isGenerating}
            >
              <Archive className="h-5 w-5" />
              {isGenerating ? "Gerando..." : "Baixar Todos os Arquivos (ZIP)"}
            </Button>

            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-2">Downloads Individuais:</h4>
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Estoque lista.txt</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(generateEstoqueContent(), "estoque_list.txt")}
                >
                  Download
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Conferência Ok.txt</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(generateConferenciaContent(), "Conferência Ok.txt")}
                >
                  Download
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Lista de Produtos ATUAIS.txt</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(generateProdutosContent(), "Lista de Produtos ATUAIS.txt")}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
