"use client"

import { useState } from "react"
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

    const filteredSuggestions = suggestions.filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))

    return (
        <div className="relative mx-auto max-w-2xl mb-12 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            <Input
                type="text"
                placeholder="Search for trading strategies, indicators, guides..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full h-14 pl-12 pr-4 text-lg rounded-xl border-2 border-indigo-100 
                   shadow-lg transition-all duration-300
                   focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300
                   hover:border-indigo-200 hover:shadow-xl"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-indigo-100">
                    {filteredSuggestions.map((suggestion, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-left px-4 py-2 hover:bg-indigo-50"
                            onClick={() => setQuery(suggestion)}
                        >
                            {suggestion}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    )
}

