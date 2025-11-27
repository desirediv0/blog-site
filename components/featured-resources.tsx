"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ResourceCard } from "./ResourceCard";

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  accessType: string;
  price: number | null;
  hasAccess: boolean;
  category: {
    name: string;
    slug: string;
  };
}

export function FeaturedResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedResources();
  }, []);

  const fetchFeaturedResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/featured");
      if (response.ok) {
        const data = await response.json();
        setResources(data.featuredResources || []);
      } else {
        setError("Failed to load resources");
      }
    } catch (err) {
      console.error("Failed to fetch featured resources:", err);
      setError("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Featured Indicators & Strategies
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
          Featured Indicators & Strategies
        </h2>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error}</p>
        </Card>
      </section>
    );
  }

  if (resources.length === 0) {
    return (
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Featured Indicators & Strategies
        </h2>
        <Card className="p-8 text-center">
          <p className="text-gray-600">
            No featured resources available at the moment
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center mb-8">
        Featured Indicators & Strategies
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {resources.slice(0, 6).map((resource) => (
          <ResourceCard
            key={resource.id}
            id={resource.id}
            title={resource.title}
            slug={resource.slug}
            description={resource.description}
            coverImage={resource.coverImage}
            accessType={resource.accessType}
            price={resource.price}
            hasAccess={resource.hasAccess}
            category={resource.category}
          />
        ))}
      </div>
    </section>
  );
}
