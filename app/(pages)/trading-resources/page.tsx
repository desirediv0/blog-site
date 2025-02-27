import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const resources = [
    {
        title: "Beginner's Guide to Trading",
        type: "Guide",
        description: "A comprehensive guide for newcomers to the trading world.",
    },
    {
        title: "Advanced Candlestick Patterns",
        type: "Ebook",
        description: "Master the art of reading candlestick patterns for better trading decisions.",
    },
    {
        title: "Risk Management Cheat Sheet",
        type: "Download",
        description: "Essential risk management strategies every trader should know.",
    },
    {
        title: "Technical Analysis Fundamentals",
        type: "Mini Course",
        description: "Learn the basics of technical analysis in this compact course.",
    },
]

export default function TradingResources() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center ">Trading Resources</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resources.map((resource, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{resource.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-2">{resource.type}</p>
                            <p className="mb-4">{resource.description}</p>
                            <Button>Access Resource</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

