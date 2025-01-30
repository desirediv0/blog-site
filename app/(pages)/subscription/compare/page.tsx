import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const plans = [
    {
        title: "Free",
        price: "$0/month",
        features: ["Basic market analysis", "Limited access to trading resources", "Public forum access", "Email support"],
    },
    {
        title: "Premium",
        price: "$49/month",
        features: [
            "Advanced market analysis",
            "Full access to trading resources",
            "Private forum access",
            "Priority email support",
            "Weekly webinars",
            "Custom indicators",
        ],
    },
]

export default function ComparePlans() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Free vs Premium</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {plans.map((plan, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{plan.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold mb-4">{plan.price}</p>
                            <ul className="mb-6">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="mb-2 flex items-center">
                                        <svg
                                            className="w-4 h-4 mr-2 text-green-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button className="w-full">{plan.title === "Free" ? "Sign Up" : "Upgrade"}</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

