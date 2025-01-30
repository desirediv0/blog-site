import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const articles = [
    { title: "Understanding Market Trends", excerpt: "Learn how to identify and analyze market trends..." },
    { title: "Top 5 Trading Strategies for 2023", excerpt: "Discover the most effective trading strategies..." },
    { title: "Mastering Technical Analysis", excerpt: "A comprehensive guide to technical analysis..." },
]

export function LatestArticles() {
    return (
        <section className="py-16">
            <h2 className="text-3xl font-bold text-center mb-8">Latest Articles & Market Commentary</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{article.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{article.excerpt}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}

