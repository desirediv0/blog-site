"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Newsletter() {
    return (
        <section className="py-16">
            <h2 className="text-3xl font-bold text-center mb-8">Stay Updated</h2>
            <div className="max-w-xl mx-auto">
                <p className="mb-6 text-lg text-gray-600">
                    Subscribe to our newsletter to receive the latest market insights, trading strategies, and exclusive
                    resources.
                </p>
                <form className="flex">
                    <Input type="email" placeholder="Enter your email" className="flex-grow mr-4 rounded-l-md" />
                    <Button className="rounded-r-md bg-indigo-600 hover:bg-indigo-700 text-white">Subscribe</Button>
                </form>
            </div>
        </section>
    )
}

