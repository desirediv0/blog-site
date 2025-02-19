import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const exclusiveResources = [
    {
        title: "Advanced Trading Strategies Ebook",
        description: "Exclusive ebook covering advanced trading strategies used by professionals.",
    },
    {
        title: "Weekly Market Analysis Webinar",
        description: "Join our experts every week for an in-depth analysis of market trends.",
    },
    {
        title: "Custom Indicator Pack",
        description: "A set of custom indicators developed by our team of expert traders.",
    },
    {
        title: "One-on-One Mentoring Session",
        description: "Book a personal mentoring session with one of our experienced traders.",
    },
]

export default function ExclusiveResources() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">Exclusive Resources</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {exclusiveResources.map((resource, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{resource.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{resource.description}</p>
                            <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]">Access Resource</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

