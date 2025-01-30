import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ManageSubscription() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Manage Subscription</h1>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Your Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold mb-4">Premium</p>
                    <p className="mb-4">Your next billing date is: July 1, 2023</p>
                    <div className="space-y-4">
                        <Button className="w-full">Change Plan</Button>
                        <Button variant="outline" className="w-full">
                            Cancel Subscription
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

