import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const pineScripts = [
    {
        title: "Advanced RSI with Divergence",
        description: "A Pine Script that implements an advanced RSI indicator with divergence detection.",
    },
    {
        title: "Multi-Timeframe Moving Average",
        description: "A script that displays moving averages from multiple timeframes on a single chart.",
    },
    {
        title: "Volume Profile Indicator",
        description: "A custom volume profile indicator to visualize trading volume at different price levels.",
    },
    {
        title: "Ichimoku Cloud with Signals",
        description: "An enhanced Ichimoku Cloud indicator that generates buy and sell signals.",
    },
]

export default function PineScriptLibrary() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">Pine Script Library</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {pineScripts.map((script, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{script.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{script.description}</p>
                            <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]">View Script</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

