import { FeaturedResources } from "./featured-resources";
import { LatestArticles } from "./latest-articles";
import { MarketCharts } from "./market-charts";
import { Newsletter } from "./newsletter";
import { QuickSuggestions } from "./quick-suggestions";
import { SearchBar } from "./search-bar";


export default function Hero() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4">
                {/* Hero Section */}
                <section className="py-12 md:py-24 text-center">
                    <h1 className="mb-6 p-2 text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--custom-500)] to-purple-600">
                        Trading Resources & Analysis
                    </h1>
                    <p className="mb-12 text-lg md:text-xl text-gray-600">
                        Discover trading strategies, indicators, and market insights
                    </p>

                    <SearchBar />
                    <QuickSuggestions />
                </section>

                <MarketCharts />
                <LatestArticles />
                <FeaturedResources />
                <Newsletter />
            </div>
        </div>
    )
}

