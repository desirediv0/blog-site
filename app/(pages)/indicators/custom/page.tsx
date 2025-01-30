import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const customIndicators = [
    {
        title: "Multi-Factor Momentum Indicator",
        description: "A custom indicator that combines multiple momentum factors for more accurate trend identification.",
    },
    {
        title: "Advanced Money Flow Index",
        description: "An enhanced version of the Money Flow Index with additional signals and alerts.",
    },
    {
        title: "Volatility Regime Detector",
        description: "A custom indicator that helps identify different volatility regimes in the market.",
    },
    {
        title: "Adaptive Moving Average Convergence Divergence",
        description: "An adaptive version of the popular MACD indicator that adjusts to market conditions.",
    },
]

export default function CustomIndicators() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Custom Indicators</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {customIndicators.map((indicator, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{indicator.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{indicator.description}</p>
                            <Button>Learn More</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

