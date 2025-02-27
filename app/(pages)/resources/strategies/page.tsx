import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const strategies = [
    {
        title: "Essential Trading Psychology Tips",
        description:
            "Learn how to master your emotions and develop a winning mindset for successful trading.",
    },
    {
        title: "Technical Analysis Fundamentals",
        description:
            "Ma ster the basics of chart patterns, indicators, and technical analysis tools.",
    },
    {
        title: "Position Sizing Strategies",
        description:
            "Discover effective position sizing methods to optimize your risk-reward ratio.",
    },
    {
        title: "Building a Trading System",
        description:
            "Step-by-step guide to creating and testing your own trading strategy.",
    },
];

export default function strategiesAndEbooks() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)] capitalize">
        strategies & Ebooks
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        {strategies.map((guide, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {guide.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{guide.description}</p>
              <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white">
                Read Guide
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
