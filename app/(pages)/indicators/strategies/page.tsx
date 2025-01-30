import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const strategies = [
    {
        title: "Mean Reversion Strategy",
        description: "A detailed breakdown of a mean reversion trading strategy using custom indicators.",
    },
    {
        title: "Trend Following with Moving Averages",
        description: "An in-depth look at a trend following strategy using multiple moving averages.",
    },
    {
        title: "Breakout Trading Strategy",
        description: "Analysis of a breakout trading strategy with custom entry and exit rules.",
    },
    {
        title: "Pairs Trading Strategy",
        description: "Explanation of a pairs trading strategy using correlation and statistical analysis.",
    },
]

export default function StrategyBreakdown() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Strategy Breakdown</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {strategies.map((strategy, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{strategy.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{strategy.description}</p>
                            <Button>View Strategy</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

