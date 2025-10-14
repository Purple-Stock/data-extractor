"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, FileText, Download, TableIcon, FileDown, MapPin } from "lucide-react"
import { read, utils } from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  const [exportFormat, setExportFormat] = useState<"estoque" | "produtos">("estoque")
  const [previewContent, setPreviewContent] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"data" | "preview">("data")
  const [searchLocation, setSearchLocation] = useState<string>("")
  const [showAllLocations, setShowAllLocations] = useState(false)
  const [isFirstDragOver, setIsFirstDragOver] = useState(false)
  const [isSecondDragOver, setIsSecondDragOver] = useState(false)
  const [isLocationDragOver, setIsLocationDragOver] = useState(false)

  // Update preview content when export format or matched data changes
  useEffect(() => {
    updatePreviewContent()
  }, [exportFormat, matchedData, activeTab])

  const updatePreviewContent = () => {
    if (matchedData.length === 0) {
      setPreviewContent([])
      return
    }

    // Get data for the current tab
    const dataToPreview = getFilteredData(activeTab).slice(0, 3)

    if (exportFormat === "estoque") {
      const header = "CODIGO;QTDA;VALOR UNIT;DESCRIÇÃO;EXTRAINF01"
      const rows = dataToPreview.map((row) => {
        let valorUnit = "0.00"
        if (row.VALORUNIT) {
          const numValue = Number.parseFloat(String(row.VALORUNIT).replace(",", "."))
          if (!isNaN(numValue)) {
            valorUnit = numValue.toFixed(2)
          }
        }
        return `${row["Cód. Auxiliar"] || ""};${row.QUANTIDADE || "0"};${valorUnit};${row["Descrição_1"] || ""};${row.EXTRAINF01 || ""}`
      })
      setPreviewContent([header, ...rows])
    } else {
      const header = "CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA"
      const rows = dataToPreview.map(
        (row) =>
          `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.EXTRAINF01 || ""};${row.EXTRAINF02 || ""};0`,
      )
      setPreviewContent([header, ...rows])
    }
  }

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

  // Drag and drop handlers for first file
  const handleFirstDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFirstDragOver(true)
  }

  const handleFirstDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFirstDragOver(false)
  }

  const handleFirstDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFirstDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setFirstFile(files[0])
    }
  }

  // Drag and drop handlers for second file
  const handleSecondDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSecondDragOver(true)
  }

  const handleSecondDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSecondDragOver(false)
  }

  const handleSecondDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSecondDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setSecondFile(files[0])
    }
  }

  // Drag and drop handlers for location file
  const handleLocationDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLocationDragOver(true)
  }

  const handleLocationDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLocationDragOver(false)
  }

  const handleLocationDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLocationDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setLocationFile(files[0])
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
    let content = "CODIGO;QTDA;VALOR UNIT;DESCRIÇÃO;EXTRAINF01\n"
    data.forEach((row) => {
      let valorUnit = "0.00"
      if (row.VALORUNIT) {
        const numValue = Number.parseFloat(String(row.VALORUNIT).replace(",", "."))
        if (!isNaN(numValue)) {
          valorUnit = numValue.toFixed(2)
        }
      }
      const line = `${row["Cód. Auxiliar"] || ""};${row.QUANTIDADE || "0"};${valorUnit};${row["Descrição_1"] || ""};${row.EXTRAINF01 || ""}`
      content += line + "\n"
    })
    return content
  }

  // Function to generate the product list content
  const generateProdutosContent = (data: MatchedRow[]) => {
    let content = "CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n"
    data.forEach((row) => {
      const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.EXTRAINF01 || ""};${row.EXTRAINF02 || ""};0`
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
      const generateContent = exportFormat === "estoque" ? generateEstoqueContent : generateProdutosContent
      const filePrefix = exportFormat === "estoque" ? "estoque_list" : "produtos_list"

      // Add a file for all locations combined
      zip.file(`${filePrefix}_TODOS.txt`, generateContent(matchedData))

      // Add a file for each location
      locations.forEach((location) => {
        const locationData = matchedData.filter((row) => row.LOCALIZAÇÃO === location)
        const safeLocationName = location.replace(/[^a-z0-9]/gi, "_").toUpperCase()
        zip.file(`${filePrefix}_${safeLocationName}.txt`, generateContent(locationData))
      })

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" })

      // Download the zip file
      const url = URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = `${filePrefix}_por_secao.zip`
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

    if (exportFormat === "estoque") {
      const content = generateEstoqueContent(locationData)
      downloadFile(content, `estoque_list_${safeLocationName}.txt`)
    } else {
      const content = generateProdutosContent(locationData)
      downloadFile(content, `produtos_list_${safeLocationName}.txt`)
    }
  }

  // Get preview data for the export format table
  const getPreviewData = (): any[] => {
    const data = getFilteredData(activeTab).slice(0, 10)

    if (exportFormat === "estoque") {
      return data.map((row) => {
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
          DESCRIÇÃO: row["Descrição_1"] || "",
          EXTRAINF01: row.EXTRAINF01 || "",
        }
      })
    } else {
      return data.map((row) => {
        return {
          CODE: row["Cód. Auxiliar"] || "",
          DESCRIPTION: row["Descrição_1"] || "",
          EXTRAINF01: row.EXTRAINF01 || "",
          EXTRAINF02: row.EXTRAINF02 || "",
          REQEXTRADATA: "0",
        }
      })
    }
  }

  // Filter locations based on search
  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(searchLocation.toLowerCase()),
  )

  // Limit the number of displayed locations unless "show all" is clicked
  const displayedLocations = showAllLocations ? filteredLocations : filteredLocations.slice(0, 10)

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-4">
          INVENTÁRIO CONTAGEM POR SEÇÃO
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Faça upload dos arquivos Excel para comparar, combinar dados e separar por localização
        </p>
      </div>

      <Card className="card-hover shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            Upload de Arquivos
          </CardTitle>
          <CardDescription className="text-base">
            Selecione os arquivos Excel e o arquivo de localização
          </CardDescription>
        </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Primeiro Arquivo Excel
              <span className="text-xs text-muted-foreground block font-normal">(com EXTRAINF02)</span>
            </label>
            <div className="flex items-center justify-center w-full">
              <label 
                className={`upload-area flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group ${
                  isFirstDragOver 
                    ? "bg-primary/10 border-primary dark:bg-primary/20 dark:border-primary scale-105" 
                    : "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50 border-slate-300 dark:border-slate-600"
                }`}
                onDragOver={handleFirstDragOver}
                onDragLeave={handleFirstDragLeave}
                onDrop={handleFirstDrop}
              >
                <div className="flex flex-col items-center justify-center pt-4 pb-4">
                  <div className={`p-2 rounded-full transition-colors mb-2 ${
                    isFirstDragOver 
                      ? "bg-primary/20 scale-110" 
                      : "bg-primary/10 group-hover:bg-primary/20"
                  }`}>
                    <Upload className={`w-5 h-5 text-primary transition-transform ${
                      isFirstDragOver ? "scale-110" : ""
                    }`} />
                  </div>
                  <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {firstFile ? firstFile.name : (isFirstDragOver ? "Solte o arquivo aqui" : "Clique ou arraste o arquivo aqui")}
                  </p>
                  <p className="text-xs text-muted-foreground">.xlsx, .xls, .csv</p>
                </div>
                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFirstFileChange} />
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Segundo Arquivo Excel
              <span className="text-xs text-muted-foreground block font-normal">(com Cód. Produto)</span>
            </label>
            <div className="flex items-center justify-center w-full">
              <label 
                className={`upload-area flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group ${
                  isSecondDragOver 
                    ? "bg-primary/10 border-primary dark:bg-primary/20 dark:border-primary scale-105" 
                    : "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50 border-slate-300 dark:border-slate-600"
                }`}
                onDragOver={handleSecondDragOver}
                onDragLeave={handleSecondDragLeave}
                onDrop={handleSecondDrop}
              >
                <div className="flex flex-col items-center justify-center pt-4 pb-4">
                  <div className={`p-2 rounded-full transition-colors mb-2 ${
                    isSecondDragOver 
                      ? "bg-primary/20 scale-110" 
                      : "bg-primary/10 group-hover:bg-primary/20"
                  }`}>
                    <Upload className={`w-5 h-5 text-primary transition-transform ${
                      isSecondDragOver ? "scale-110" : ""
                    }`} />
                  </div>
                  <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {secondFile ? secondFile.name : (isSecondDragOver ? "Solte o arquivo aqui" : "Clique ou arraste o arquivo aqui")}
                  </p>
                  <p className="text-xs text-muted-foreground">.xlsx, .xls, .csv</p>
                </div>
                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleSecondFileChange} />
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Arquivo de Localização
              <span className="text-xs text-muted-foreground block font-normal">(com COD LOCAL e LOCALIZAÇÃO)</span>
            </label>
            <div className="flex items-center justify-center w-full">
              <label 
                className={`upload-area flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group ${
                  isLocationDragOver 
                    ? "bg-primary/10 border-primary dark:bg-primary/20 dark:border-primary scale-105" 
                    : "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50 border-slate-300 dark:border-slate-600"
                }`}
                onDragOver={handleLocationDragOver}
                onDragLeave={handleLocationDragLeave}
                onDrop={handleLocationDrop}
              >
                <div className="flex flex-col items-center justify-center pt-4 pb-4">
                  <div className={`p-2 rounded-full transition-colors mb-2 ${
                    isLocationDragOver 
                      ? "bg-primary/20 scale-110" 
                      : "bg-primary/10 group-hover:bg-primary/20"
                  }`}>
                    <Upload className={`w-5 h-5 text-primary transition-transform ${
                      isLocationDragOver ? "scale-110" : ""
                    }`} />
                  </div>
                  <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {locationFile ? locationFile.name : (isLocationDragOver ? "Solte o arquivo aqui" : "Clique ou arraste o arquivo aqui")}
                  </p>
                  <p className="text-xs text-muted-foreground">.xlsx, .xls, .csv</p>
                </div>
                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleLocationFileChange} />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={processFiles}
            disabled={isLoading || !firstFile || !secondFile || !locationFile}
            className="button-glow w-full md:w-auto px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </div>
            ) : (
              "Comparar Arquivos"
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              {error}
            </div>
          </div>
        )}

        {matchedData.length > 0 && (
          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
              <h3 className="text-lg font-medium">Resultados por Seção</h3>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Formato de exportação:</label>
                  <select
                    className="border rounded px-2 py-1 text-sm bg-background"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as "estoque" | "produtos")}
                  >
                    <option value="estoque">Estoque (CODIGO;QTDA;VALOR UNIT;DESCRIÇÃO;EXTRAINF01)</option>
                    <option value="produtos">Produtos (CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA)</option>
                  </select>
                </div>

                <Button onClick={downloadAllLocationFiles} disabled={isGenerating} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {isGenerating ? "Gerando..." : "Baixar Todos os Arquivos"}
                </Button>
              </div>
            </div>

            {/* Location search and tabs */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder="Buscar seção..."
                  className="border rounded px-3 py-1 text-sm w-full md:w-64 bg-background"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                <Button
                  variant={activeTab === "all" ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setActiveTab("all")}
                >
                  Todos
                </Button>

                {displayedLocations.map((location) => (
                  <Button
                    key={location}
                    variant={activeTab === location ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setActiveTab(location)}
                  >
                    {location}
                  </Button>
                ))}
              </div>

              {filteredLocations.length > 10 && !showAllLocations && (
                <Button variant="link" size="sm" className="text-xs p-0" onClick={() => setShowAllLocations(true)}>
                  Mostrar todas as {filteredLocations.length} seções
                </Button>
              )}

              {showAllLocations && (
                <Button variant="link" size="sm" className="text-xs p-0" onClick={() => setShowAllLocations(false)}>
                  Mostrar menos
                </Button>
              )}
            </div>

            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500 dark:text-slate-400">
                Mostrando {getFilteredData(activeTab).length} de {matchedData.length} itens
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-md overflow-hidden border">
                  <Button
                    variant={viewMode === "data" ? "default" : "outline"}
                    size="sm"
                    className="rounded-none border-0"
                    onClick={() => setViewMode("data")}
                  >
                    <TableIcon className="h-4 w-4 mr-1" />
                    Dados Completos
                  </Button>
                  <Button
                    variant={viewMode === "preview" ? "default" : "outline"}
                    size="sm"
                    className="rounded-none border-0"
                    onClick={() => setViewMode("preview")}
                  >
                    <FileDown className="h-4 w-4 mr-1" />
                    Prévia de Exportação
                  </Button>
                </div>

                {activeTab !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLocationFile(activeTab)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar {activeTab}
                  </Button>
                )}
              </div>
            </div>

            {/* Complete data view */}
            {viewMode === "data" && (
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
            )}

            {/* Export preview view */}
            {viewMode === "preview" && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {exportFormat === "estoque" ? (
                        <>
                          <TableHead>CODIGO</TableHead>
                          <TableHead>QTDA</TableHead>
                          <TableHead>VALOR UNIT</TableHead>
                          <TableHead>DESCRIÇÃO</TableHead>
                          <TableHead>EXTRAINF01</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>CODE</TableHead>
                          <TableHead>DESCRIPTION</TableHead>
                          <TableHead>EXTRAINF01</TableHead>
                          <TableHead>EXTRAINF02</TableHead>
                          <TableHead>REQEXTRADATA</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPreviewData().map((row, index) => (
                      <TableRow key={index}>
                        {exportFormat === "estoque" ? (
                          <>
                            <TableCell>{row.CODIGO}</TableCell>
                            <TableCell>{row.QTDA}</TableCell>
                            <TableCell>{row["VALOR UNIT"]}</TableCell>
                            <TableCell>{row.DESCRIÇÃO}</TableCell>
                            <TableCell>{row.EXTRAINF01}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{row.CODE}</TableCell>
                            <TableCell>{row.DESCRIPTION}</TableCell>
                            <TableCell>{row.EXTRAINF01}</TableCell>
                            <TableCell>{row.EXTRAINF02}</TableCell>
                            <TableCell>{row.REQEXTRADATA}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {getFilteredData(activeTab).length > 10 && (
              <div className="mt-2 text-sm text-gray-500 dark:text-slate-400 text-center">
                Mostrando apenas os primeiros 10 itens. Baixe o arquivo para ver todos os itens.
              </div>
            )}

            {/* Text preview of export format */}
            {previewContent.length > 0 && (
              <div className="mt-6 border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">
                  Prévia do formato de exportação {activeTab !== "all" ? `para "${activeTab}"` : ""}:
                </h4>
                <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded border text-sm font-mono overflow-x-auto">
                  {previewContent.map((line, index) => (
                    <div key={index} className={index === 0 ? "text-blue-600 dark:text-blue-400 font-medium" : ""}>
                      {line}
                    </div>
                  ))}
                  {previewContent.length > 1 && (
                    <div className="text-gray-500 dark:text-slate-500 mt-1 text-xs">
                      {getFilteredData(activeTab).length > previewContent.length - 1
                        ? `... e mais ${getFilteredData(activeTab).length - (previewContent.length - 1)} linhas`
                        : ""}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  )
}
