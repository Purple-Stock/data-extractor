"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbsProps {
  className?: string
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Skip rendering breadcrumbs on the home page
  if (pathname === "/") {
    return null
  }

  // Define routes and their display names
  const routes: Record<string, string> = {
    "/": "INVENTÁRIO CONTAGEM GERAL",
    "/location": "INVENTÁRIO CONTAGEM POR SEÇÃO",
  }

  // Build breadcrumb segments
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => {
      const path = `/${array.slice(0, index + 1).join("/")}`
      const label = routes[path] || segment.charAt(0).toUpperCase() + segment.slice(1)
      const isLast = index === array.length - 1

      return { path, label, isLast }
    })

  return (
    <nav
      className={cn(
        "flex items-center text-sm text-gray-600 dark:text-slate-400 py-2 px-4 md:px-6 bg-gray-200/60 dark:bg-slate-800/40",
        className,
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-gray-900 dark:hover:text-slate-200 transition-colors"
            aria-label="Início"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {segments.map((segment, index) => (
          <li key={segment.path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" aria-hidden="true" />
            {segment.isLast ? (
              <span className="font-medium text-gray-900 dark:text-slate-200" aria-current="page">
                {segment.label}
              </span>
            ) : (
              <Link href={segment.path} className="hover:text-gray-900 dark:hover:text-slate-200 transition-colors">
                {segment.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
