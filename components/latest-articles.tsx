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

export function LatestArticles() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestBlogs();
  }, []);

  const fetchLatestBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/featured");
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.latestBlogs || []);
      } else {
        setError("Failed to load articles");
      }
    } catch (err) {
      console.error("Failed to fetch latest blogs:", err);
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Latest Articles & Market Commentary
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Latest Articles & Market Commentary
        </h2>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error}</p>
        </Card>
      </section>
    );
  }

  if (blogs.length === 0) {
    return (
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Latest Articles & Market Commentary
        </h2>
        <Card className="p-8 text-center">
          <p className="text-gray-600">No articles available at the moment</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center mb-8">
        Latest Articles & Market Commentary
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {blogs.slice(0, 6).map((blog) => (
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
    </section>
  );
}
