"use client"

import type React from "react"
import { useState } from "react"
import { Upload } from "lucide-react"
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
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <Card className="mx-auto max-w-5xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Comparador de Arquivos Excel</CardTitle>
          <CardDescription>Faça upload de dois arquivos Excel para comparar e combinar dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
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
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={processFiles}
              disabled={isLoading || !firstFile || !secondFile}
              className="w-full md:w-auto"
            >
              {isLoading ? "Processando..." : "Comparar Arquivos"}
            </Button>
          </div>

          {error && <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">{error}</div>}

          {matchedData.length > 0 && (
            <>
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Resultados (Primeiras 5 linhas)</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>EXTRAINF02</TableHead>
                        <TableHead>Cód. Produto</TableHead>
                        <TableHead>Cód. Auxiliar</TableHead>
                        <TableHead>Descrição (Arquivo 1)</TableHead>
                        <TableHead>EXTRAINF01</TableHead>
                        <TableHead>QUANTIDADE</TableHead>
                        <TableHead>VALORUNIT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matchedData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.EXTRAINF02}</TableCell>
                          <TableCell>{row["Cód. Produto"]}</TableCell>
                          <TableCell>{row["Cód. Auxiliar"]}</TableCell>
                          <TableCell>{row["Descrição_1"]}</TableCell>
                          <TableCell>{row.EXTRAINF01}</TableCell>
                          <TableCell>{row.QUANTIDADE}</TableCell>
                          <TableCell>{row.VALORUNIT}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-slate-500">
                  Total de correspondências encontradas: {matchedData.length}
                </div>
              </div>

              <FilePreview matchedData={matchedData} />
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
