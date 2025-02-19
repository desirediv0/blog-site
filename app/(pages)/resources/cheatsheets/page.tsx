import { Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const cheatsheets = [
    {
        title: "Candlestick Patterns Cheat Sheet",
        description: "A quick reference guide for identifying and interpreting common candlestick patterns."
    },
    {
        title: "Technical Indicators Cheat Sheet",
        description: "An overview of popular technical indicators and how to use them in your analysis."
    },
    {
        title: "Forex Trading Terminologies",
        description: "A comprehensive list of forex trading terms and their definitions."
    },
    {
        title: "Options Greeks Cheat Sheet",
        description: "A quick guide to understanding and using options Greeks in your trading."
    },
]

export default function CheatSheetsAndDownloads() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-2 text-center text-[var(--custom-500)]">Cheat Sheets & Downloads</h1>
                <p className="text-[var(--custom-600)] text-center mb-8">Download free trading resources and guides</p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {cheatsheets.map((cheatsheet, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl  ">{cheatsheet.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-6 text-gray-600">{cheatsheet.description}</p>
                                <Button
                                    className="w-full sm:w-auto bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}