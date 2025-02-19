import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const indicators = [
    {
        title: "Moving Average Convergence Divergence (MACD)",
        type: "Indicator",
        description:
            "A trend-following momentum indicator that shows the relationship between two moving averages of a security's price.",
    },
    {
        title: "Relative Strength Index (RSI)",
        type: "Indicator",
        description: "A momentum oscillator that measures the speed and change of price movements.",
    },
    {
        title: "Bollinger Bands",
        type: "Indicator",
        description:
            "A volatility indicator that consists of three lines: a simple moving average (middle band) and two standard deviations away from that average (upper and lower bands).",
    },
    {
        title: "Simple Moving Average Crossover",
        type: "Strategy",
        description: "A basic trading strategy that uses two moving averages to generate buy and sell signals.",
    },
]

export default function IndicatorsScripts() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">Indicators & Scripts</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {indicators.map((indicator, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{indicator.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-2">{indicator.type}</p>
                            <p className="mb-4">{indicator.description}</p>
                            <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]">View Details</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

