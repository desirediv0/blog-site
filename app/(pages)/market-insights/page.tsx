import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const insights = [
    {
        title: "Weekly Market Outlook",
        date: "2023-05-15",
        description: "An overview of the major market trends and potential trading opportunities for the upcoming week.",
    },
    {
        title: "Cryptocurrency Market Analysis",
        date: "2023-05-14",
        description: "In-depth analysis of recent cryptocurrency market movements and future projections.",
    },
    {
        title: "Earnings Season Impact",
        date: "2023-05-13",
        description: "How the current earnings season is affecting various sectors and individual stocks.",
    },
    {
        title: "Global Economic Indicators",
        date: "2023-05-12",
        description: "A roundup of key economic indicators and their potential impact on financial markets.",
    },
]

export default function MarketInsights() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">Market Insights</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {insights.map((insight, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{insight.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-2">Published on {insight.date}</p>
                            <p className="mb-4">{insight.description}</p>
                            <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]">Read More</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

