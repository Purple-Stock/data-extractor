"use client"

import { LocationMatcher } from "@/components/location-matcher"

export default function LocationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-8">
      <LocationMatcher />
    </main>
  )
}
