import { FileUploader } from "@/components/file-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Conversor de Excel para TXT</h1>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Upload de Arquivos</CardTitle>
          <CardDescription>Faça upload dos arquivos Excel para convertê-los em arquivos TXT</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader />
        </CardContent>
      </Card>
    </div>
  )
}
