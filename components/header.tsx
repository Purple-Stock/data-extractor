"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileSpreadsheet, MapPin, FileText } from "lucide-react"
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
    {
      href: "/location-simple",
      label: "INVENTÁRIO CONTAGEM SIMPLES",
      icon: FileText,
      active: pathname === "/location-simple",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-8 flex items-center space-x-3 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Excel Matcher
            </span>
          </Link>
          <nav className="flex items-center space-x-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50 group",
                  route.active 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <route.icon className="h-4 w-4" />
                  <span>{route.label}</span>
                </div>
                {route.active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile navigation */}
        <div className="flex md:hidden">
          <Link href="/" className="mr-2 flex items-center space-x-2 group">
            <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Excel Matcher
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between md:justify-end">
          <nav className="flex items-center md:hidden space-x-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
                  route.active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground",
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
