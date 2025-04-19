"use server"

import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import * as XLSX from "xlsx"

export async function processFiles(formData: FormData) {
  try {
    console.log("Iniciando processamento dos arquivos...")

    // Obter os arquivos do FormData
    const mainFile = formData.get("mainFile") as File
    const eanFile = formData.get("eanFile") as File | null

    if (!mainFile) {
      return {
        success: false,
        error: "Arquivo principal não fornecido",
      }
    }

    console.log(`Arquivo principal: ${mainFile.name}, tamanho: ${mainFile.size} bytes`)
    if (eanFile) {
      console.log(`Arquivo EAN: ${eanFile.name}, tamanho: ${eanFile.size} bytes`)
    }

    // Criar diretório para os arquivos temporários se não existir
    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
      console.log(`Diretório de uploads criado: ${uploadDir}`)
    }

    // Processar o arquivo principal
    console.log("Lendo o arquivo principal...")
    const mainFileBuffer = await mainFile.arrayBuffer()
    const mainWorkbook = XLSX.read(new Uint8Array(mainFileBuffer), { type: "array" })

    // Obter a primeira planilha
    const mainSheetName = mainWorkbook.SheetNames[0]
    console.log(`Nome da planilha: ${mainSheetName}`)
    const mainSheet = mainWorkbook.Sheets[mainSheetName]

    // Verificar o formato da planilha
    const range = XLSX.utils.decode_range(mainSheet["!ref"] || "A1:A1")
    console.log(`Range da planilha: ${mainSheet["!ref"]}`)
    console.log(`Número de linhas: ${range.e.r - range.s.r + 1}`)
    console.log(`Número de colunas: ${range.e.c - range.s.c + 1}`)

    // Tentar diferentes abordagens para ler os dados
    console.log("Tentando ler os dados com cabeçalhos...")
    let produtos = XLSX.utils.sheet_to_json(mainSheet, { header: 1 })

    // Verificar se temos dados
    if (!produtos || produtos.length === 0) {
      console.log("Nenhum dado encontrado com cabeçalhos. Tentando sem cabeçalhos...")
      produtos = XLSX.utils.sheet_to_json(mainSheet, { header: "A" })
    }

    if (!produtos || produtos.length === 0) {
      return {
        success: false,
        error: "Nenhum dado encontrado no arquivo principal",
      }
    }

    console.log(`Total de linhas lidas: ${produtos.length}`)

    // Obter os cabeçalhos (primeira linha)
    const headers = produtos[0]
    console.log("Cabeçalhos encontrados:", headers)

    // Exibir algumas linhas para depuração
    console.log("Primeiras 2 linhas de dados:")
    console.log(produtos.slice(1, 3))

    // Mapear os índices das colunas necessárias
    const colunas = {
      codigo: findColumnIndex(headers, ["CODIGO", "CODE", "COD", "CÓDIGO", "CODPROD", "PRODUTO", "ID"]),
      descricao: findColumnIndex(headers, [
        "DESCRICAO",
        "DESCRIPTION",
        "DESC",
        "DESCRIÇÃO",
        "NOME",
        "PRODUTO",
        "DESCR",
      ]),
      quantidade: findColumnIndex(headers, ["QTDA", "QTD", "QUANTIDADE", "QUANTITY", "QUANT", "QT", "ESTOQUE"]),
      valorUnitario: findColumnIndex(headers, [
        "VALOR UNIT",
        "VALOR",
        "PRECO",
        "PRICE",
        "VALOR UNITÁRIO",
        "PREÇO",
        "CUSTO",
      ]),
      extraInfo1: findColumnIndex(headers, ["EXTRAINF01", "EXTRA1", "INFO1", "INFORMACAO1", "INFORMAÇÃO1", "OBS1"]),
      extraInfo2: findColumnIndex(headers, ["EXTRAINF02", "EXTRA2", "INFO2", "INFORMACAO2", "INFORMAÇÃO2", "OBS2"]),
      reqExtraData: findColumnIndex(headers, ["REQEXTRADATA", "EXTRADATA", "DATA", "DATE", "DATAREQ"]),
    }

    console.log("Mapeamento de colunas:", colunas)

    // Verificar se encontramos as colunas essenciais
    if (colunas.codigo === null || colunas.descricao === null || colunas.quantidade === null) {
      // Tentar uma abordagem alternativa - usar índices numéricos
      console.log("Colunas obrigatórias não encontradas. Tentando abordagem alternativa...")

      // Se os cabeçalhos não forem encontrados, vamos assumir que:
      // - A primeira coluna é o código
      // - A segunda coluna é a descrição
      // - A terceira coluna (se existir) é a quantidade

      // Verificar se temos pelo menos 3 colunas na primeira linha
      const primeiraLinha = produtos[0]
      const numColunas = Array.isArray(primeiraLinha) ? primeiraLinha.length : Object.keys(primeiraLinha).length

      console.log(`Número de colunas na primeira linha: ${numColunas}`)

      if (numColunas >= 3) {
        console.log("Usando mapeamento de colunas por posição...")

        // Se estamos usando header: 1, as colunas são índices numéricos
        if (Array.isArray(primeiraLinha)) {
          colunas.codigo = 0
          colunas.descricao = 1
          colunas.quantidade = 2
          if (numColunas > 3) colunas.valorUnitario = 3
          if (numColunas > 4) colunas.extraInfo1 = 4
          if (numColunas > 5) colunas.extraInfo2 = 5
          if (numColunas > 6) colunas.reqExtraData = 6
        }
        // Se estamos usando header: "A", as colunas são letras
        else {
          colunas.codigo = "A"
          colunas.descricao = "B"
          colunas.quantidade = "C"
          if (numColunas > 3) colunas.valorUnitario = "D"
          if (numColunas > 4) colunas.extraInfo1 = "E"
          if (numColunas > 5) colunas.extraInfo2 = "F"
          if (numColunas > 6) colunas.reqExtraData = "G"
        }

        console.log("Novo mapeamento de colunas:", colunas)
      } else {
        return {
          success: false,
          error: `Colunas obrigatórias não encontradas no arquivo. Verifique se o arquivo contém as colunas: CODIGO, DESCRICAO e QTDA. Cabeçalhos encontrados: ${JSON.stringify(headers)}`,
        }
      }
    }

    // Processar o arquivo EAN se fornecido
    const eanMap: Record<string, string> = {}
    if (eanFile) {
      console.log("Processando arquivo EAN...")
      const eanFileBuffer = await eanFile.arrayBuffer()
      const eanWorkbook = XLSX.read(new Uint8Array(eanFileBuffer), { type: "array" })

      const eanSheetName = eanWorkbook.SheetNames[0]
      const eanSheet = eanWorkbook.Sheets[eanSheetName]

      const eanData = XLSX.utils.sheet_to_json(eanSheet)
      console.log(`Dados EAN lidos: ${eanData.length} registros`)

      // Criar mapa de EAN
      eanData.forEach((item: any) => {
        const codigoProduto = item.CODIGO_PRODUTO || item.CODIGO || item.CODE
        const ean = item.EAN || item.GTIN || item.BARCODE
        if (codigoProduto && ean) {
          eanMap[codigoProduto] = ean
        }
      })
      console.log(`Mapa EAN criado com ${Object.keys(eanMap).length} registros`)
    }

    // Gerar os arquivos TXT
    const timestamp = Date.now()
    console.log(`Gerando arquivos TXT com timestamp: ${timestamp}`)

    // Função para obter valor seguro de uma célula
    const getValue = (row: any, colIndex: string | null | number): string => {
      if (colIndex === null) return ""

      // Se for um array (header: 1)
      if (Array.isArray(row)) {
        return row[colIndex as number] !== undefined ? String(row[colIndex as number]) : ""
      }

      // Se for um objeto (header: "A" ou header: true)
      return row[colIndex] !== undefined ? String(row[colIndex]) : ""
    }

    // 1. Estoque lista.txt
    console.log("Gerando arquivo Estoque lista.txt...")
    const estoqueLinhas = produtos.slice(1).map((row) => {
      const codigo = getValue(row, colunas.codigo)
      const quantidade = getValue(row, colunas.quantidade)
      const valorUnit = getValue(row, colunas.valorUnitario)
      return `${codigo};${quantidade};${valorUnit}`
    })

    console.log(`Linhas geradas para Estoque lista.txt: ${estoqueLinhas.length}`)
    console.log("Amostra de linhas:", estoqueLinhas.slice(0, 2))

    const estoqueConteudo = ["CODIGO;QTDA;VALOR UNIT", ...estoqueLinhas].join("\n")
    const estoqueFilename = `estoque-lista-${timestamp}.txt`
    const estoquePath = join(uploadDir, estoqueFilename)
    await writeFile(estoquePath, estoqueConteudo)
    console.log(`Arquivo salvo: ${estoquePath}`)

    // 2. Conferência Ok.txt
    console.log("Gerando arquivo Conferência Ok.txt...")
    const conferenciaLinhas = produtos.slice(1).map((row) => {
      const codigo = getValue(row, colunas.codigo)
      const descricao = getValue(row, colunas.descricao)
      const quantidade = getValue(row, colunas.quantidade)
      const extraInfo1 = getValue(row, colunas.extraInfo1)
      const extraInfo2 = getValue(row, colunas.extraInfo2)
      const reqExtraData = getValue(row, colunas.reqExtraData)
      return `${codigo};${descricao};${quantidade};${extraInfo1};${extraInfo2};${reqExtraData}`
    })

    console.log(`Linhas geradas para Conferência Ok.txt: ${conferenciaLinhas.length}`)
    console.log("Amostra de linhas:", conferenciaLinhas.slice(0, 2))

    const conferenciaConteudo = ["CODIGO;DESCRICAO;QTDA;EXTRAINF01;EXTRAINF02;REQEXTRADATA", ...conferenciaLinhas].join(
      "\n",
    )
    const conferenciaFilename = `conferencia-ok-${timestamp}.txt`
    const conferenciaPath = join(uploadDir, conferenciaFilename)
    await writeFile(conferenciaPath, conferenciaConteudo)
    console.log(`Arquivo salvo: ${conferenciaPath}`)

    // 3. Lista de Produtos ATUAIS.txt
    console.log("Gerando arquivo Lista de Produtos ATUAIS.txt...")
    const produtosLinhas = produtos.slice(1).map((row) => {
      const codigo = getValue(row, colunas.codigo)
      const descricao = getValue(row, colunas.descricao)
      const extraInfo1 = getValue(row, colunas.extraInfo1)
      const extraInfo2 = getValue(row, colunas.extraInfo2)
      const reqExtraData = getValue(row, colunas.reqExtraData)
      return `${codigo};${descricao};${extraInfo1};${extraInfo2};${reqExtraData}`
    })

    console.log(`Linhas geradas para Lista de Produtos ATUAIS.txt: ${produtosLinhas.length}`)
    console.log("Amostra de linhas:", produtosLinhas.slice(0, 2))

    const produtosConteudo = ["CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA", ...produtosLinhas].join("\n")
    const produtosFilename = `lista-produtos-atuais-${timestamp}.txt`
    const produtosPath = join(uploadDir, produtosFilename)
    await writeFile(produtosPath, produtosConteudo)
    console.log(`Arquivo salvo: ${produtosPath}`)

    console.log("Processamento concluído com sucesso!")

    // Retornar os links para download e as prévias
    return {
      success: true,
      files: {
        estoque: estoqueFilename,
        conferencia: conferenciaFilename,
        produtos: produtosFilename,
      },
      previews: {
        estoque: ["CODIGO;QTDA;VALOR UNIT", ...estoqueLinhas.slice(0, 5)],
        conferencia: ["CODIGO;DESCRICAO;QTDA;EXTRAINF01;EXTRAINF02;REQEXTRADATA", ...conferenciaLinhas.slice(0, 5)],
        produtos: ["CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA", ...produtosLinhas.slice(0, 5)],
      },
      totalLines: {
        estoque: estoqueLinhas.length,
        conferencia: conferenciaLinhas.length,
        produtos: produtosLinhas.length,
      },
      debug: {
        headers: headers,
        colunas: colunas,
        primeirasLinhas: produtos.slice(1, 3),
      },
    }
  } catch (error) {
    console.error("Erro ao processar arquivos:", error)
    return {
      success: false,
      error: `Erro ao processar os arquivos: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      stack: error instanceof Error ? error.stack : undefined,
    }
  }
}

// Função auxiliar para encontrar o índice da coluna com base em possíveis nomes
function findColumnIndex(headers: any, possibleNames: string[]): string | null | number {
  // Se headers for um array (quando usamos header: 1)
  if (Array.isArray(headers)) {
    for (const name of possibleNames) {
      const index = headers.findIndex((header) => header && String(header).toUpperCase() === name.toUpperCase())
      if (index !== -1) return index
    }
    return null
  }

  // Se headers for um objeto (quando usamos header: "A" ou header: true)
  for (const name of possibleNames) {
    for (const key in headers) {
      if (headers[key] && String(headers[key]).toUpperCase() === name.toUpperCase()) {
        return key
      }
    }
  }
  return null
}
