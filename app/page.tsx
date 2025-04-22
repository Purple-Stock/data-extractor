import ExcelMatcherClient from "./excel-matcher-client"

export const metadata = {
  title: "INVENTÁRIO CONTAGEM GERAL | Excel Matcher",
  description: "Compare e combine dados de arquivos Excel",
}

export default function Home() {
  return <ExcelMatcherClient />
}
