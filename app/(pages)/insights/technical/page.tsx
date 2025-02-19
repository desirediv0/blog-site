import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const technicalCommentary = [
    {
        title: "S&P 500 Technical Analysis",
        description: "In-depth technical analysis of S&P 500, including key support and resistance levels.",
    },
    {
        title: "EUR/USD Forex Pair Analysis",
        description:
            "Technical commentary on the EUR/USD forex pair, including trend analysis and potential entry/exit points.",
    },
    {
        title: "Gold Price Action",
        description: "Detailed analysis of gold's recent price action and potential future movements.",
    },
    {
        title: "Tesla Stock Technical Outlook",
        description: "Technical analysis of Tesla stock, including chart patterns and indicator readings.",
    },
]

export default function TechnicalCommentary() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">Technical Commentary</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {technicalCommentary.map((commentary, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{commentary.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{commentary.description}</p>
                            <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]">View Full Analysis</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

