"use client"

import { LocationMatcher } from "@/components/location-matcher"

export default function LocationPage() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-slate-950 p-4 md:p-8">
      <LocationMatcher />
    </main>
  )
}
