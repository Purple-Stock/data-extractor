import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const filename = url.searchParams.get("file")

    if (!filename) {
      return new NextResponse("Nome do arquivo não fornecido", { status: 400 })
    }

    // Verificar se o nome do arquivo é seguro (evitar path traversal)
    if (filename.includes("..") || filename.includes("/")) {
      return new NextResponse("Nome de arquivo inválido", { status: 400 })
    }

    const filePath = join(process.cwd(), "public", "uploads", filename)

    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      console.error(`Arquivo não encontrado: ${filePath}`)
      return new NextResponse("Arquivo não encontrado", { status: 404 })
    }

    try {
      const fileContent = await readFile(filePath)

      // Definir o nome do arquivo para download
      let downloadFilename = filename
      if (filename.startsWith("estoque-lista-")) {
        downloadFilename = "Estoque lista.txt"
      } else if (filename.startsWith("conferencia-ok-")) {
        downloadFilename = "Conferência Ok.txt"
      } else if (filename.startsWith("lista-produtos-atuais-")) {
        downloadFilename = "Lista de Produtos ATUAIS.txt"
      }

      return new NextResponse(fileContent, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${downloadFilename}"`,
        },
      })
    } catch (error) {
      console.error(`Erro ao ler arquivo: ${error}`)
      return new NextResponse("Erro ao ler arquivo", { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao processar download:", error)
    return new NextResponse("Erro interno do servidor", { status: 500 })
  }
}
