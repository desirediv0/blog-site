import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const dailyInsights = [
    {
        title: "US Market Outlook",
        description: "Analysis of key US market indices and potential market movers for the day.",
    },
    {
        title: "European Markets Update",
        description: "Overview of European markets and important economic indicators to watch.",
    },
    {
        title: "Asian Markets Recap",
        description: "Summary of overnight action in Asian markets and its potential impact on global trading.",
    },
    {
        title: "Commodities Watch",
        description: "Daily analysis of major commodities including oil, gold, and agricultural products.",
    },
]

export default function DailyAnalysis() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Daily Analysis</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {dailyInsights.map((insight, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{insight.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{insight.description}</p>
                            <Button>Read Full Analysis</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

