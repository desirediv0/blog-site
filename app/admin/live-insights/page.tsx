'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Blog {
    id: string;
    title: string;
    slug: string;
    featured: boolean;
    published: boolean;
    category: {
        name: string;
    };
}

export default function LiveInsightsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/blogs');
            if (response.ok) {
                const data = await response.json();
                // Filter for market insights related blogs
                const insightsBlogs = data.blogs.filter((blog: Blog) =>
                    blog.category.name.toLowerCase().includes('insight') ||
                    blog.category.name.toLowerCase().includes('market')
                );
                setBlogs(insightsBlogs);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
            toast.error('Failed to load insights');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
        try {
            const response = await fetch('/api/featured', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'BLOG',
                    id,
                    featured: !currentFeatured,
                }),
            });

            if (response.ok) {
                toast.success(currentFeatured ? 'Removed from featured' : 'Added to featured');
                fetchBlogs();
            } else {
                toast.error('Failed to update');
            }
        } catch (error) {
            console.error('Failed to toggle featured:', error);
            toast.error('Failed to update');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Live Market Insights</h1>
                <Link href="/admin/blogs/create">
                    <Button>Create New Insight</Button>
                </Link>
            </div>

            <Card className="p-6 mb-6">
                <p className="text-gray-600">
                    Manage market insights that appear on the home page. Toggle featured status to show/hide insights.
                </p>
            </Card>

            {blogs.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-600">No market insights found. Create blogs in Market Insights category.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {blogs.map((blog) => (
                        <Card key={blog.id} className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{blog.title}</h3>
                                    <p className="text-sm text-gray-600">{blog.category.name}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`text-xs px-2 py-1 rounded ${blog.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {blog.published ? 'Published' : 'Draft'}
                                        </span>
                                        {blog.featured && (
                                            <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={blog.featured ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleToggleFeatured(blog.id, blog.featured)}
                                    >
                                        {blog.featured ? 'Remove from Featured' : 'Add to Featured'}
                                    </Button>
                                    <Link href={`/admin/blogs/${blog.id}`}>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}


