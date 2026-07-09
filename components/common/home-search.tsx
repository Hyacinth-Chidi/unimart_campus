"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HomeSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(currentQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`)
    } else {
      router.push(`/`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto flex items-center bg-background rounded-full border shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
      <div className="flex-1 flex items-center px-4">
        <SearchIcon className="size-5 text-muted-foreground mr-3" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for textbooks, phones, mini-fridges..." 
          className="w-full bg-transparent border-none focus:outline-none text-base py-2 placeholder:text-muted-foreground"
        />
      </div>
      <Button type="submit" size="lg" className="rounded-full px-8 text-base font-semibold">
        Search
      </Button>
    </form>
  )
}
