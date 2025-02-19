import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const courses = [
    {
        title: "Technical Analysis Fundamentals",
        description: "A mini-course covering the basics of technical analysis for beginners.",
    },
    {
        title: "Advanced Candlestick Patterns",
        description: "An in-depth course on identifying and trading with complex candlestick patterns.",
    },
    {
        title: "Risk Management Mastery",
        description: "Learn how to effectively manage risk in your trading with this comprehensive course.",
    },
    {
        title: "Algorithmic Trading Blueprint",
        description: "A step-by-step guide to creating and implementing your own trading algorithms.",
    },
]

export default function MiniCoursesAndBlueprints() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">Mini Courses & Blueprints</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {courses.map((course, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{course.description}</p>
                            <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]">Start Course</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

