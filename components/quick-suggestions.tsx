import { Button } from "@/components/ui/button"
import { LineChart, Download, Lightbulb, BarChart4, FileCode, FileSpreadsheet } from "lucide-react"

const suggestions = [
    {
        text: "Top Trading Strategies",
        icon: LineChart,
    },
    {
        text: "Latest Market Insights",
        icon: Lightbulb,
    },
    {
        text: "Download Cheat Sheets",
        icon: Download,
    },
    {
        text: "Custom Indicators Library",
        icon: BarChart4,
    },
    {
        text: "Free Pine Scripts",
        icon: FileCode,
    },
    {
        text: "Excel Tools",
        icon: FileSpreadsheet,
    },
]

export function QuickSuggestions() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {suggestions.map(({ text, icon: Icon }) => (
                <Button
                    key={text}
                    variant="outline"
                    className="h-auto py-6 px-4 bg-white/50 hover:bg-white/80 border-indigo-100 
                   hover:border-indigo-300 shadow-sm hover:shadow-md transition-all"
                >
                    <div className="flex flex-col items-center gap-2">
                        <Icon className="w-6 h-6 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">{text}</span>
                    </div>
                </Button>
            ))}
        </div>
    )
}

