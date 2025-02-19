import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const guides = [
    {
        title: "Beginner's Guide to Forex Trading",
        description: "A comprehensive guide to help beginners understand and start forex trading.",
    },
    {
        title: "Advanced Options Trading Strategies",
        description: "In-depth guide covering advanced options trading strategies for experienced traders.",
    },
    {
        title: "Understanding Market Sentiment",
        description: "A guide to interpreting and using market sentiment in your trading decisions.",
    },
    {
        title: "Risk Management for Traders",
        description: "Essential risk management techniques every trader should know and implement.",
    },
]

export default function GuidesAndEbooks() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">Guides & Ebooks</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {guides.map((guide, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle
                                className="text-lg font-semibold"
                            >{guide.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{guide.description}</p>
                            <Button
                                className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white"
                            >Read Guide</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

