import type React from "react"

export const metadata = {
  title: "Comparador com Localização | Excel Matcher",
  description: "Compare e agrupe dados de Excel por localização",
}

export default function LocationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
