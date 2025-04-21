"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText } from "lucide-react"
import { read, utils } from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JSZip from "jszip"

interface FirstFileRow {
  EXTRAINF02: string
  DESCRIÇÃO: string
  EXTRAINF01: string
  QUANTIDADE: string
  VALORUNIT: string
  [key: string]: string
}

interface SecondFileRow {
  "Cód. Produto": string
  "Cód. Auxiliar": string
  Descrição: string
  Embalagem: string
  Unidade: string
  "Qt. Unit.": string
  "Cód. Fab.": string
  [key: string]: string
}

interface LocationFileRow {
  "Cód.": string
  EXTRAINF02: string
  DESCRIÇÃO: string
  EXTRAINF01: string
  "COD LOCAL": string
  LOCALIZAÇÃO: string
  [key: string]: string
}

interface MatchedRow {
  EXTRAINF02: string
  "Cód. Produto": string
  "Cód. Auxiliar": string
  Descrição_1: string
  Descrição_2: string
  EXTRAINF01: string
  Embalagem: string
  Unidade: string
  QUANTIDADE: string
  VALORUNIT: string
  "COD LOCAL"?: string
  LOCALIZAÇÃO?: string
  [key: string]: string | undefined
}

export function LocationMatcher() {
  const [firstFile, setFirstFile] = useState<File | null>(null)
  const [secondFile, setSecondFile] = useState<File | null>(null)
  const [locationFile, setLocationFile] = useState<File | null>(null)
  const [matchedData, setMatchedData] = useState<MatchedRow[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleFirstFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFirstFile(e.target.files[0])
    }
  }

  const handleSecondFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSecondFile(e.target.files[0])
    }
  }

  const handleLocationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLocationFile(e.target.files[0])
    }
  }

  const processFiles = async () => {
    if (!firstFile || !secondFile || !locationFile) {
      setError("Por favor, selecione todos os arquivos necessários")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Read first file
      const firstFileData = await firstFile.arrayBuffer()
      const firstWorkbook = read(firstFileData)
      const firstWorksheet = firstWorkbook.Sheets[firstWorkbook.SheetNames[0]]
      const firstJsonData = utils.sheet_to_json<FirstFileRow>(firstWorksheet)

      // Read second file
      const secondFileData = await secondFile.arrayBuffer()
      const secondWorkbook = read(secondFileData)
      const secondWorksheet = secondWorkbook.Sheets[secondWorkbook.SheetNames[0]]
      const secondJsonData = utils.sheet_to_json<SecondFileRow>(secondWorksheet)

      // Read location file
      const locationFileData = await locationFile.arrayBuffer()
      const locationWorkbook = read(locationFileData)
      const locationWorksheet = locationWorkbook.Sheets[locationWorkbook.SheetNames[0]]
      const locationJsonData = utils.sheet_to_json<LocationFileRow>(locationWorksheet)

      // Match data
      const matched: MatchedRow[] = []
      const uniqueLocations = new Set<string>()

      firstJsonData.forEach((firstRow) => {
        const matchingRow = secondJsonData.find((secondRow) => secondRow["Cód. Produto"] === firstRow.EXTRAINF02)
        const locationRow = locationJsonData.find((locRow) => locRow.EXTRAINF02 === firstRow.EXTRAINF02)

        if (matchingRow) {
          const location = locationRow?.LOCALIZAÇÃO || "SEM LOCALIZAÇÃO"
          uniqueLocations.add(location)

          matched.push({
            EXTRAINF02: firstRow.EXTRAINF02,
            "Cód. Produto": matchingRow["Cód. Produto"],
            "Cód. Auxiliar": matchingRow["Cód. Auxiliar"],
            Descrição_1: firstRow.DESCRIÇÃO,
            Descrição_2: matchingRow["Descrição"],
            EXTRAINF01: firstRow.EXTRAINF01,
            Embalagem: matchingRow["Embalagem"],
            Unidade: matchingRow["Unidade"],
            QUANTIDADE: firstRow.QUANTIDADE,
            VALORUNIT: firstRow.VALORUNIT,
            "COD LOCAL": locationRow?.["COD LOCAL"],
            LOCALIZAÇÃO: location,
          })
        }
      })

      setMatchedData(matched)
      setLocations(Array.from(uniqueLocations))
      setActiveTab("all")
    } catch (err) {
      console.error(err)
      setError("Erro ao processar os arquivos. Verifique se os arquivos estão no formato correto.")
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredData = (location?: string) => {
    if (!location || location === "all") {
      return matchedData
    }
    return matchedData.filter((row) => row.LOCALIZAÇÃO === location)
  }

  const generateEstoqueContent = (data: MatchedRow[]) => {
    let content = "CODIGO;QTDA;VALOR UNIT\n"
    data.forEach((row) => {
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

  const downloadAllLocationFiles = async () => {
    setIsGenerating(true)
    try {
      const zip = new JSZip()

      // Add a file for all locations combined
      zip.file("estoque_list_TODOS.txt", generateEstoqueContent(matchedData))

      // Add a file for each location
      locations.forEach((location) => {
        const locationData = matchedData.filter((row) => row.LOCALIZAÇÃO === location)
        const safeLocationName = location.replace(/[^a-z0-9]/gi, "_").toUpperCase()
        zip.file(`estoque_list_${safeLocationName}.txt`, generateEstoqueContent(locationData))
      })

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" })

      // Download the zip file
      const url = URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = "estoque_por_localizacao.zip"
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

  const downloadLocationFile = (location: string) => {
    const locationData = matchedData.filter((row) => row.LOCALIZAÇÃO === location)
    const safeLocationName = location.replace(/[^a-z0-9]/gi, "_").toUpperCase()
    const content = generateEstoqueContent(locationData)
    downloadFile(content, `estoque_list_${safeLocationName}.txt`)
  }

  return (
    <Card className="mx-auto max-w-5xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Comparador de Arquivos com Localização</CardTitle>
        <CardDescription>
          Faça upload dos arquivos Excel para comparar, combinar dados e separar por localização
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Primeiro Arquivo Excel (com EXTRAINF02)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-slate-500" />
                  <p className="mb-2 text-sm text-slate-500">
                    {firstFile ? firstFile.name : "Clique para selecionar o arquivo"}
                  </p>
                </div>
                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFirstFileChange} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Segundo Arquivo Excel (com Cód. Produto)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-slate-500" />
                  <p className="mb-2 text-sm text-slate-500">
                    {secondFile ? secondFile.name : "Clique para selecionar o arquivo"}
                  </p>
                </div>
                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleSecondFileChange} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Arquivo de Localização</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-slate-500" />
                  <p className="mb-2 text-sm text-slate-500">
                    {locationFile ? locationFile.name : "Clique para selecionar o arquivo"}
                  </p>
                </div>
                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleLocationFileChange} />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={processFiles}
            disabled={isLoading || !firstFile || !secondFile || !locationFile}
            className="w-full md:w-auto"
          >
            {isLoading ? "Processando..." : "Comparar Arquivos"}
          </Button>
        </div>

        {error && <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">{error}</div>}

        {matchedData.length > 0 && (
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Resultados por Localização</h3>
                <Button onClick={downloadAllLocationFiles} disabled={isGenerating} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {isGenerating ? "Gerando..." : "Baixar Todos os Arquivos"}
                </Button>
              </div>

              <TabsList className="mb-4 flex flex-wrap">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {locations.map((location) => (
                  <TabsTrigger key={location} value={location}>
                    {location}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab}>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {getFilteredData(activeTab).length} de {matchedData.length} itens
                  </div>
                  {activeTab !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadLocationFile(activeTab)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Baixar {activeTab}
                    </Button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>EXTRAINF02</TableHead>
                        <TableHead>Cód. Auxiliar</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>EXTRAINF01</TableHead>
                        <TableHead>QUANTIDADE</TableHead>
                        <TableHead>VALORUNIT</TableHead>
                        <TableHead>COD LOCAL</TableHead>
                        <TableHead>LOCALIZAÇÃO</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredData(activeTab)
                        .slice(0, 10)
                        .map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.EXTRAINF02}</TableCell>
                            <TableCell>{row["Cód. Auxiliar"]}</TableCell>
                            <TableCell>{row["Descrição_1"]}</TableCell>
                            <TableCell>{row.EXTRAINF01}</TableCell>
                            <TableCell>{row.QUANTIDADE}</TableCell>
                            <TableCell>{row.VALORUNIT}</TableCell>
                            <TableCell>{row["COD LOCAL"]}</TableCell>
                            <TableCell>{row.LOCALIZAÇÃO}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                {getFilteredData(activeTab).length > 10 && (
                  <div className="mt-2 text-sm text-muted-foreground text-center">
                    Mostrando apenas os primeiros 10 itens. Baixe o arquivo para ver todos os itens.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
