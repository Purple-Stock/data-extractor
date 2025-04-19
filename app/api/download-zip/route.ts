import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import JSZip from "jszip"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const files = url.searchParams.getAll("file")

    if (!files || files.length === 0) {
      return new NextResponse("Nenhum arquivo especificado", { status: 400 })
    }

    // Criar um novo arquivo ZIP
    const zip = new JSZip()

    // Adicionar cada arquivo ao ZIP
    for (const filename of files) {
      // Verificar se o nome do arquivo é seguro (evitar path traversal)
      if (filename.includes("..") || filename.includes("/")) {
        continue // Pular arquivos com nomes inseguros
      }

      const filePath = join(process.cwd(), "public", "uploads", filename)

      // Verificar se o arquivo existe
      if (!existsSync(filePath)) {
        console.error(`Arquivo não encontrado: ${filePath}`)
        continue // Pular arquivos que não existem
      }

      try {
        const fileContent = await readFile(filePath)

        // Definir o nome do arquivo no ZIP
        let zipFilename = filename
        if (filename.startsWith("estoque-lista-")) {
          zipFilename = "Estoque lista.txt"
        } else if (filename.startsWith("conferencia-ok-")) {
          zipFilename = "Conferência Ok.txt"
        } else if (filename.startsWith("lista-produtos-atuais-")) {
          zipFilename = "Lista de Produtos ATUAIS.txt"
        }

        // Adicionar o arquivo ao ZIP
        zip.file(zipFilename, fileContent)
      } catch (error) {
        console.error(`Erro ao ler arquivo ${filename}:`, error)
      }
    }

    // Gerar o conteúdo do ZIP
    const zipContent = await zip.generateAsync({ type: "nodebuffer" })

    // Retornar o arquivo ZIP
    return new NextResponse(zipContent, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="arquivos_convertidos.zip"`,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar ZIP:", error)
    return new NextResponse("Erro ao gerar arquivo ZIP", { status: 500 })
  }
}
