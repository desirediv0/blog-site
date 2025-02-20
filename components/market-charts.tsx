import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MarketCharts() {
    return (
        <section className="py-16 grid gap-8">
            <h2 className="text-3xl font-bold text-center mb-8">
                Featured Stocks
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>NSE Market Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-gray-100 rounded-lg animate-pulse" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Trading Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-gray-100 rounded-lg animate-pulse" />
                    </CardContent>
                </Card>
            </div>
            <h2 className="text-3xl font-bold text-center mt-8">Live Market Insights</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>NSE Market Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-gray-100 rounded-lg animate-pulse" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Trading Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-gray-100 rounded-lg animate-pulse" />
                    </CardContent>
                </Card>
            </div>

        </section>
    )
}

