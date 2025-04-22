"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileSpreadsheet, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "INVENTÁRIO CONTAGEM GERAL",
      icon: FileSpreadsheet,
      active: pathname === "/",
    },
    {
      href: "/location",
      label: "INVENTÁRIO CONTAGEM POR SEÇÃO",
      icon: MapPin,
      active: pathname === "/location",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <FileSpreadsheet className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Excel Matcher</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  route.active ? "text-foreground" : "text-foreground/60",
                )}
              >
                <div className="flex items-center gap-1">
                  <route.icon className="h-4 w-4" />
                  <span>{route.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile navigation */}
        <div className="flex md:hidden">
          <Link href="/" className="mr-2 flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span className="font-bold">Excel Matcher</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between md:justify-end">
          <nav className="flex items-center md:hidden">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
                  route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <route.icon className="h-4 w-4 mr-1" />
                <span className="sr-only md:not-sr-only md:inline-block">{route.label}</span>
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
