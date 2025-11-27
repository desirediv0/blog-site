'use client';

import { useEffect, useState } from 'react';
import { BlogCard } from '@/components/BlogCard';
import { Card } from '@/components/ui/card';

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
}

export default function Screeners() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await fetch('/api/blogs?category=screeners');
            if (response.ok) {
                const data = await response.json();
                setBlogs(data.blogs || []);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">
                Screeners
            </h1>
            <p className="text-center text-gray-600 mb-8">
                Stock screeners and market analysis tools
            </p>

            {blogs.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-600">No screeners available yet</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <BlogCard key={blog.id} {...blog} />
                    ))}
                </div>
            )}
        </div>
    );
}
