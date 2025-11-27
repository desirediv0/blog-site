"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CreditCard } from "lucide-react"

export default function Payment() {
    const [cardNumber, setCardNumber] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvc, setCvc] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would integrate with a payment processor like Stripe
        console.log("Processing payment...")
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">Payment</h1>
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>Enter your payment details to complete the purchase.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Input
                                    id="cardNumber"
                                    placeholder="Card number"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <Input id="expiry" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                                <Input id="cvc" placeholder="CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSubmit}>
                        <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

