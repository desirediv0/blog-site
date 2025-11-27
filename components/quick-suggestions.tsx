"use client"

import { Button } from "@/components/ui/button"
import { LineChart, Download, Lightbulb, BarChart4, FileCode, FileSpreadsheet } from "lucide-react"
import Link from "next/link"

const suggestions = [
    {
        text: "Top Trading Strategies",
        icon: LineChart,
        href: "/resources/strategies",
    },
    {
        text: "Latest Market Insights",
        icon: Lightbulb,
        href: "/insights/daily",
    },
    {
        text: "Download Cheat Sheets",
        icon: Download,
        href: "/resources/cheatsheets",
    },
    {
        text: "Custom Indicators Library",
        icon: BarChart4,
        href: "/indicators/custom",
    },
    {
        text: "Free Pine Scripts",
        icon: FileCode,
        href: "/indicators/pine-scripts",
    },
    {
        text: "Excel Tools",
        icon: FileSpreadsheet,
        href: "/resources/courses",
    },
]

export function QuickSuggestions() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {suggestions.map(({ text, icon: Icon, href }) => (
                <Link key={text} href={href}>
                    <Button
                        variant="outline"
                        className="w-full h-auto py-6 px-4 bg-white/50 hover:bg-white/80 border-[var(--custom-100)] 
                       hover:border-[var(--custom-300)] shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Icon className="w-8 h-8 text-[var(--custom-600)]" />
                            <span className="text-sm font-medium text-gray-700">{text}</span>
                        </div>
                    </Button>
                </Link>
            ))}
        </div>
    )
}

