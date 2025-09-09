"use client"

import { useState } from "react"
import { Archive, Download, FileText } from "lucide-react"
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
      DESCRIÇÃO: row["Descrição_1"] || "",
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
    let content = "CODIGO;DESCRIÇÃO;QTDA;VALOR UNIT\n"
    matchedData.forEach((row) => {
      let valorUnit = "0.00"
      if (row.VALORUNIT) {
        const numValue = Number.parseFloat(String(row.VALORUNIT).replace(",", "."))
        if (!isNaN(numValue)) {
          valorUnit = numValue.toFixed(2)
        }
      }
      const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.QUANTIDADE || "0"};${valorUnit}`
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
    <div className="mt-12">
      <Card className="card-hover shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
            <Archive className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Prévia dos Arquivos
          </CardTitle>
          <CardDescription className="text-base">
            Visualize e baixe os arquivos gerados a partir dos dados combinados
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="estoque" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Estoque lista.txt
              </TabsTrigger>
              <TabsTrigger value="conferencia" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Conferência Ok.txt
              </TabsTrigger>
              <TabsTrigger value="produtos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Lista de Produtos ATUAIS.txt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="estoque" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Mostrando 5 de {matchedData.length} linhas
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">CODIGO</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">DESCRIÇÃO</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">QTDA</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">VALOR UNIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estoquePreview.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-3 font-medium">{row.CODIGO}</td>
                        <td className="px-6 py-3 max-w-xs truncate">{row.DESCRIÇÃO}</td>
                        <td className="px-6 py-3 text-center">{row.QTDA}</td>
                        <td className="px-6 py-3 text-right font-mono">{row["VALOR UNIT"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="conferencia" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Mostrando 5 de {matchedData.length} linhas
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">CODIGO</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">DESCRIÇÃO</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">QTDA</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">EXTRAINF01</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">EXTRAINF02</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">REQEXTRADATA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conferenciaPreview.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-3 font-medium">{row.CODIGO}</td>
                        <td className="px-6 py-3 max-w-xs truncate">{row["DESCRI  O"]}</td>
                        <td className="px-6 py-3 text-center">{row.QTDA}</td>
                        <td className="px-6 py-3">{row.EXTRAINF01}</td>
                        <td className="px-6 py-3">{row.EXTRAINF02}</td>
                        <td className="px-6 py-3 text-center">{row.REQEXTRADATA}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="produtos" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Mostrando 5 de {matchedData.length} linhas
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">CODE</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">DESCRIPTION</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">EXTRAINF01</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">EXTRAINF02</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">REQEXTRADATA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosPreview.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-3 font-medium">{row.CODE}</td>
                        <td className="px-6 py-3 max-w-xs truncate">{row.DESCRIPTION}</td>
                        <td className="px-6 py-3">{row.EXTRAINF01}</td>
                        <td className="px-6 py-3">{row.EXTRAINF02}</td>
                        <td className="px-6 py-3 text-center">{row.REQEXTRADATA}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Arquivos Gerados</h3>
              <p className="text-muted-foreground">Baixe os arquivos individuais ou todos de uma vez</p>
            </div>
            
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-6 mb-8">
              <Button
                onClick={downloadAllFiles}
                className="button-glow w-full flex items-center justify-center gap-3 py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isGenerating}
                size="lg"
              >
                <Archive className="h-5 w-5" />
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gerando ZIP...
                  </div>
                ) : (
                  "Baixar Todos os Arquivos (ZIP)"
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Downloads Individuais:</h4>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Estoque lista.txt</p>
                        <p className="text-xs text-muted-foreground">Dados de estoque</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(generateEstoqueContent(), "estoque_list.txt")}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Conferência Ok.txt</p>
                        <p className="text-xs text-muted-foreground">Dados de conferência</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(generateConferenciaContent(), "Conferência Ok.txt")}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                        <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Lista de Produtos ATUAIS.txt</p>
                        <p className="text-xs text-muted-foreground">Lista de produtos</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(generateProdutosContent(), "Lista de Produtos ATUAIS.txt")}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
