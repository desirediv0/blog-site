"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const suggestions = [
    "Top trading strategies for beginners",
    "Advanced candlestick patterns",
    "How to use RSI indicator",
    "Best Pine scripts for trend following",
    "Excel template for backtesting",
    "Market sentiment analysis techniques",
]

export function SearchBar() {
    const [query, setQuery] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const router = useRouter()

    const filteredSuggestions = suggestions.filter((suggestion) => 
        query === "" || suggestion.toLowerCase().includes(query.toLowerCase())
    )

    const handleSearch = (e: FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/blogs?search=${encodeURIComponent(query.trim())}`)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion)
        setShowSuggestions(false)
        router.push(`/blogs?search=${encodeURIComponent(suggestion)}`)
    }

    return (
        <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl mb-12 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[var(--custom-500)] transition-colors" />
            <Input
                type="text"
                placeholder="Search for trading strategies, indicators, guides..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full h-14 pl-12 pr-4 text-lg rounded-xl border-2 border-[var(--custom-100)] 
                   shadow-lg transition-all duration-300
                   focus:ring-2 focus:ring-[var(--custom-200)] focus:border-[var(--custom-200)]
                   hover:border-[var(--custom-200)] hover:shadow-xl"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-[var(--custom-100)] max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <Button
                            key={index}
                            type="button"
                            variant="ghost"
                            className="w-full justify-start text-left px-4 py-2 hover:bg-[var(--custom-50)]"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </Button>
                    ))}
                </div>
            )}
        </form>
    )
}

