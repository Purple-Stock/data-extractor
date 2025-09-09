"use client"

import type React from "react"
import { useState } from "react"
import { Upload, FileSpreadsheet } from "lucide-react"
import { read, utils } from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FilePreview } from "@/components/file-preview"

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
  [key: string]: string
}

export default function ExcelMatcherClient() {
  const [firstFile, setFirstFile] = useState<File | null>(null)
  const [secondFile, setSecondFile] = useState<File | null>(null)
  const [matchedData, setMatchedData] = useState<MatchedRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFirstDragOver, setIsFirstDragOver] = useState(false)
  const [isSecondDragOver, setIsSecondDragOver] = useState(false)

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

  const processFiles = async () => {
    if (!firstFile || !secondFile) {
      setError("Por favor, selecione ambos os arquivos Excel")
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

      // Match data
      const matched: MatchedRow[] = []

      firstJsonData.forEach((firstRow) => {
        const matchingRow = secondJsonData.find((secondRow) => secondRow["Cód. Produto"] === firstRow.EXTRAINF02)

        if (matchingRow) {
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
          })
        }
      })

      setMatchedData(matched)
    } catch (err) {
      console.error(err)
      setError("Erro ao processar os arquivos. Verifique se os arquivos estão no formato correto.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            INVENTÁRIO CONTAGEM GERAL
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Faça upload de dois arquivos Excel para comparar e combinar dados de forma inteligente
          </p>
        </div>

        <Card className="card-hover shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Upload de Arquivos
            </CardTitle>
            <CardDescription className="text-base">
              Selecione os arquivos Excel que deseja comparar
            </CardDescription>
          </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Primeiro Arquivo Excel
                <span className="text-xs text-muted-foreground block font-normal">(com EXTRAINF02)</span>
              </label>
              <div className="flex items-center justify-center w-full">
                <label 
                  className={`upload-area flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group ${
                    isFirstDragOver 
                      ? "bg-primary/10 border-primary dark:bg-primary/20 dark:border-primary scale-105" 
                      : "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50 border-slate-300 dark:border-slate-600"
                  }`}
                  onDragOver={handleFirstDragOver}
                  onDragLeave={handleFirstDragLeave}
                  onDrop={handleFirstDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-6 pb-6">
                    <div className={`p-3 rounded-full transition-colors mb-3 ${
                      isFirstDragOver 
                        ? "bg-primary/20 scale-110" 
                        : "bg-primary/10 group-hover:bg-primary/20"
                    }`}>
                      <Upload className={`w-6 h-6 text-primary transition-transform ${
                        isFirstDragOver ? "scale-110" : ""
                      }`} />
                    </div>
                    <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {firstFile ? firstFile.name : (isFirstDragOver ? "Solte o arquivo aqui" : "Clique ou arraste o arquivo aqui")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      .xlsx, .xls, .csv
                    </p>
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
                  className={`upload-area flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group ${
                    isSecondDragOver 
                      ? "bg-primary/10 border-primary dark:bg-primary/20 dark:border-primary scale-105" 
                      : "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50 border-slate-300 dark:border-slate-600"
                  }`}
                  onDragOver={handleSecondDragOver}
                  onDragLeave={handleSecondDragLeave}
                  onDrop={handleSecondDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-6 pb-6">
                    <div className={`p-3 rounded-full transition-colors mb-3 ${
                      isSecondDragOver 
                        ? "bg-primary/20 scale-110" 
                        : "bg-primary/10 group-hover:bg-primary/20"
                    }`}>
                      <Upload className={`w-6 h-6 text-primary transition-transform ${
                        isSecondDragOver ? "scale-110" : ""
                      }`} />
                    </div>
                    <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {secondFile ? secondFile.name : (isSecondDragOver ? "Solte o arquivo aqui" : "Clique ou arraste o arquivo aqui")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      .xlsx, .xls, .csv
                    </p>
                  </div>
                  <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleSecondFileChange} />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={processFiles}
              disabled={isLoading || !firstFile || !secondFile}
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
            <>
              <div className="mt-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                    <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Resultados Encontrados
                  </h3>
                  <p className="text-muted-foreground">
                    {matchedData.length} correspondências encontradas
                  </p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                      Prévia dos Dados (Primeiras 5 linhas)
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                          <TableHead className="font-semibold">EXTRAINF02</TableHead>
                          <TableHead className="font-semibold">Cód. Produto</TableHead>
                          <TableHead className="font-semibold">Cód. Auxiliar</TableHead>
                          <TableHead className="font-semibold">Descrição (Arquivo 1)</TableHead>
                          <TableHead className="font-semibold">EXTRAINF01</TableHead>
                          <TableHead className="font-semibold">QUANTIDADE</TableHead>
                          <TableHead className="font-semibold">VALORUNIT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchedData.slice(0, 5).map((row, index) => (
                          <TableRow key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                            <TableCell className="font-medium">{row.EXTRAINF02}</TableCell>
                            <TableCell>{row["Cód. Produto"]}</TableCell>
                            <TableCell>{row["Cód. Auxiliar"]}</TableCell>
                            <TableCell className="max-w-xs truncate">{row["Descrição_1"]}</TableCell>
                            <TableCell>{row.EXTRAINF01}</TableCell>
                            <TableCell className="text-center">{row.QUANTIDADE}</TableCell>
                            <TableCell className="text-right font-mono">{row.VALORUNIT}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <FilePreview matchedData={matchedData} />
            </>
          )}
        </CardContent>
        </Card>
      </div>
    </main>
  )
}
