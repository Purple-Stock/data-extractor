"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Archive, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { processFiles } from "@/app/actions"
import { FilePreview } from "./file-preview"

type FileStatus = "idle" | "uploading" | "success" | "error"

export function FileUploader() {
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [eanFile, setEanFile] = useState<File | null>(null)
  const [status, setStatus] = useState<FileStatus>("idle")
  const [message, setMessage] = useState("")
  const [downloadLinks, setDownloadLinks] = useState<{
    estoque: string | null
    conferencia: string | null
    produtos: string | null
  }>({
    estoque: null,
    conferencia: null,
    produtos: null,
  })
  const [previews, setPreviews] = useState<{
    estoque: string[]
    conferencia: string[]
    produtos: string[]
  }>({
    estoque: [],
    conferencia: [],
    produtos: [],
  })
  const [totalLines, setTotalLines] = useState<{
    estoque: number
    conferencia: number
    produtos: number
  }>({
    estoque: 0,
    conferencia: 0,
    produtos: 0,
  })
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [errorStack, setErrorStack] = useState<string | null>(null)

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainFile(e.target.files[0])
    }
  }

  const handleEanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEanFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mainFile) {
      setStatus("error")
      setMessage("Por favor, selecione o arquivo principal.")
      return
    }

    try {
      setStatus("uploading")
      setMessage("Processando arquivos...")
      setDebugInfo(null)
      setErrorStack(null)

      const formData = new FormData()
      formData.append("mainFile", mainFile)
      if (eanFile) {
        formData.append("eanFile", eanFile)
      }

      const result = await processFiles(formData)

      if (result.success) {
        setStatus("success")
        setMessage("Arquivos processados com sucesso!")
        setDownloadLinks({
          estoque: result.files.estoque,
          conferencia: result.files.conferencia,
          produtos: result.files.produtos,
        })

        // Armazenar as prévias
        if (result.previews) {
          setPreviews({
            estoque: result.previews.estoque || [],
            conferencia: result.previews.conferencia || [],
            produtos: result.previews.produtos || [],
          })
        }

        // Armazenar o total de linhas
        if (result.totalLines) {
          setTotalLines({
            estoque: result.totalLines.estoque || 0,
            conferencia: result.totalLines.conferencia || 0,
            produtos: result.totalLines.produtos || 0,
          })
        }

        // Armazenar informações de depuração
        if (result.debug) {
          setDebugInfo(result.debug)
        }
      } else {
        setStatus("error")
        setMessage(result.error || "Erro ao processar os arquivos.")
        if (result.stack) {
          setErrorStack(result.stack)
        }
      }
    } catch (error) {
      setStatus("error")
      setMessage("Ocorreu um erro ao processar os arquivos.")
      console.error(error)
    }
  }

  // Função para gerar a URL de download do ZIP
  const getZipDownloadUrl = () => {
    if (!downloadLinks.estoque || !downloadLinks.conferencia || !downloadLinks.produtos) {
      return ""
    }

    return `/api/download-zip?file=${downloadLinks.estoque}&file=${downloadLinks.conferencia}&file=${downloadLinks.produtos}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="mainFile" className="block mb-2">
            Arquivo Principal (Obrigatório)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="mainFile"
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleMainFileChange}
              className="flex-1"
            />
            {mainFile && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Selecionado
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Selecione o arquivo principal com os dados dos produtos</p>
        </div>

        <div>
          <Label htmlFor="eanFile" className="block mb-2">
            Arquivo EAN (Opcional)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="eanFile"
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleEanFileChange}
              className="flex-1"
            />
            {eanFile && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Selecionado
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Selecione o arquivo com os códigos EAN (opcional)</p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={status === "uploading" || !mainFile}>
        {status === "uploading" ? (
          <>Processando...</>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Converter Arquivos
          </>
        )}
      </Button>

      {status !== "idle" && (
        <Alert variant={status === "error" ? "destructive" : status === "success" ? "default" : "default"}>
          {status === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : status === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : null}
          <AlertTitle>{status === "error" ? "Erro" : status === "success" ? "Sucesso" : "Processando"}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Informações de depuração em caso de erro */}
      {status === "error" && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="debug">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center">
                <Bug className="w-4 h-4 mr-2" />
                Informações de Depuração
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {errorStack && (
                <div className="bg-muted p-2 rounded text-xs font-mono whitespace-pre-wrap mb-4 overflow-auto max-h-40">
                  {errorStack}
                </div>
              )}
              <p className="text-sm mb-2">
                Se o erro persistir, verifique se o arquivo Excel está no formato correto e contém as colunas
                necessárias.
              </p>
              <p className="text-sm">
                Colunas obrigatórias: CODIGO, DESCRICAO e QTDA. Estas colunas podem ter nomes diferentes, como CODE,
                DESCRIPTION, QUANTITY, etc.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {status === "success" && (
        <div className="space-y-4">
          {/* Prévia dos arquivos */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-medium mb-4">Prévia dos Arquivos:</h3>

            <Tabs defaultValue="estoque" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="estoque">Estoque lista.txt</TabsTrigger>
                <TabsTrigger value="conferencia">Conferência Ok.txt</TabsTrigger>
                <TabsTrigger value="produtos">Lista de Produtos ATUAIS.txt</TabsTrigger>
                {debugInfo && <TabsTrigger value="debug">Depuração</TabsTrigger>}
              </TabsList>

              <TabsContent value="estoque">
                <FilePreview title="Estoque lista.txt" lines={previews.estoque} totalLines={totalLines.estoque} />
              </TabsContent>

              <TabsContent value="conferencia">
                <FilePreview
                  title="Conferência Ok.txt"
                  lines={previews.conferencia}
                  totalLines={totalLines.conferencia}
                />
              </TabsContent>

              <TabsContent value="produtos">
                <FilePreview
                  title="Lista de Produtos ATUAIS.txt"
                  lines={previews.produtos}
                  totalLines={totalLines.produtos}
                />
              </TabsContent>

              {debugInfo && (
                <TabsContent value="debug">
                  <div className="border rounded p-4 bg-muted/30">
                    <h4 className="font-medium mb-2">Informações de Depuração</h4>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium mb-1">Cabeçalhos Encontrados:</h5>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-20">
                        {JSON.stringify(debugInfo.headers, null, 2)}
                      </pre>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium mb-1">Mapeamento de Colunas:</h5>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-20">
                        {JSON.stringify(debugInfo.colunas, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-1">Amostra de Dados:</h5>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(debugInfo.primeirasLinhas, null, 2)}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Download dos arquivos */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-medium">Arquivos Gerados:</h3>

            {/* Botão para download ZIP */}
            <div className="mb-4">
              <a
                href={getZipDownloadUrl()}
                download="arquivos_convertidos.zip"
                className="flex items-center justify-center w-full p-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Archive className="w-5 h-5 mr-2" />
                Baixar Todos os Arquivos (ZIP)
              </a>
            </div>

            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">Downloads Individuais:</h4>
              <div className="space-y-2">
                {downloadLinks.estoque && <DownloadLink href={downloadLinks.estoque} filename="Estoque lista.txt" />}
                {downloadLinks.conferencia && (
                  <DownloadLink href={downloadLinks.conferencia} filename="Conferência Ok.txt" />
                )}
                {downloadLinks.produtos && (
                  <DownloadLink href={downloadLinks.produtos} filename="Lista de Produtos ATUAIS.txt" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

function DownloadLink({ href, filename }: { href: string; filename: string }) {
  return (
    <a
      href={`/api/download?file=${href}`}
      download={filename}
      className="flex items-center p-2 text-sm border rounded-md hover:bg-accent transition-colors"
    >
      <FileText className="w-4 h-4 mr-2" />
      <span className="flex-1">{filename}</span>
      <Button variant="ghost" size="sm">
        Download
      </Button>
    </a>
  )
}
