import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FilePreviewProps {
  title: string
  lines: string[]
  totalLines: number
}

export function FilePreview({ title, lines, totalLines }: FilePreviewProps) {
  // Verificar se temos linhas para exibir
  if (!lines || lines.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum dado disponível para prévia.</p>
        </CardContent>
      </Card>
    )
  }

  // Função para dividir uma linha em colunas
  const splitLine = (line: string) => {
    return line.split(";").map((item) => item.trim())
  }

  // Obter cabeçalhos da primeira linha
  const headers = splitLine(lines[0])

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <span>{title}</span>
          <span className="text-xs text-muted-foreground">
            Mostrando {Math.min(5, totalLines)} de {totalLines} linhas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="text-xs whitespace-nowrap">
                  {header || `Coluna ${index + 1}`}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.slice(1).map((line, rowIndex) => {
              const cells = splitLine(line)
              return (
                <TableRow key={rowIndex}>
                  {cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="text-xs py-2">
                      {cell || "-"}
                    </TableCell>
                  ))}
                  {/* Adicionar células vazias se necessário para alinhar com os cabeçalhos */}
                  {cells.length < headers.length &&
                    Array(headers.length - cells.length)
                      .fill(0)
                      .map((_, i) => (
                        <TableCell key={`empty-${i}`} className="text-xs py-2">
                          -
                        </TableCell>
                      ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
