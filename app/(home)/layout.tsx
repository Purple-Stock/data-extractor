import type React from "react"

export const metadata = {
  title: "INVENTÁRIO CONTAGEM GERAL | Excel Matcher",
  description: "Compare e combine dados de arquivos Excel",
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
