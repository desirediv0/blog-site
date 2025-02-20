import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const resources = [
    { title: "Advanced Candlestick Patterns", type: "Indicator" },
    { title: "Fibonacci Retracement Strategy", type: "Strategy" },
    { title: "Volume Profile Analysis", type: "Indicator" },
]

export function FeaturedResources() {
    return (
        <section className="py-16">
            <h2 className="text-3xl font-bold text-center mb-8">Featured Indicators & Strategies</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {resources.map((resource, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{resource.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{resource.type}</p>
                            <Button
                                className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white"
                            >Learn More</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}

