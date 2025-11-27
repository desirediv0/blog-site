"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BlogCard } from "./BlogCard";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  accessType: string;
  price: number | null;
  category: {
    name: string;
    slug: string;
  };
  author: {
    name: string;
  };
}

export function MarketCharts() {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/featured");
      if (response.ok) {
        const data = await response.json();
        setFeaturedBlogs(data.featuredBlogs || []);
      } else {
        setError("Failed to load featured content");
      }
    } catch (err) {
      console.error("Failed to fetch featured blogs:", err);
      setError("Failed to load featured content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 grid gap-12">
      {/* Featured Stocks Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Featured Stocks</h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-200 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600">{error}</p>
          </Card>
        ) : featuredBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {featuredBlogs.slice(0, 2).map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                title={blog.title}
                slug={blog.slug}
                excerpt={blog.excerpt}
                coverImage={blog.coverImage}
                accessType={blog.accessType}
                price={blog.price}
                category={blog.category}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No featured stocks available</p>
          </Card>
        )}
      </div>

      {/* Live Market Insights Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">
          Live Market Insights
        </h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-200 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600">{error}</p>
          </Card>
        ) : featuredBlogs.length > 2 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {featuredBlogs.slice(2, 4).map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                title={blog.title}
                slug={blog.slug}
                excerpt={blog.excerpt}
                coverImage={blog.coverImage}
                accessType={blog.accessType}
                price={blog.price}
                category={blog.category}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No market insights available</p>
          </Card>
        )}
      </div>
    </section>
  );
}
