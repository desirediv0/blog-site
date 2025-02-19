import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const marketTrends = [
    {
        title: "Emerging Technologies in Fintech",
        description: "Analysis of emerging trends in financial technology and their potential impact on markets.",
    },
    {
        title: "ESG Investing on the Rise",
        description: "Exploring the growing trend of Environmental, Social, and Governance (ESG) investing.",
    },
    {
        title: "Cryptocurrency Market Evolution",
        description: "Examining the evolving trends in the cryptocurrency market and potential future developments.",
    },
    {
        title: "AI and Machine Learning in Trading",
        description: "Investigating the increasing role of AI and machine learning in modern trading strategies.",
    },
]

export default function MarketTrends() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">Market Trends</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {marketTrends.map((trend, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{trend.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{trend.description}</p>
                            <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]">Read Full Report</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

