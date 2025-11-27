'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Blog {
    id: string;
    title: string;
    slug: string;
    accessType: string;
    published: boolean;
    publishedAt: string | null;
    featured: boolean;
    category: {
        name: string;
    };
}

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchBlogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const url = filter === 'all'
                ? '/api/admin/blogs'
                : `/api/admin/blogs?published=${filter === 'published'}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setBlogs(data.blogs);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;

        try {
            const response = await fetch(`/api/admin/blogs/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchBlogs();
            }
        } catch (error) {
            console.error('Failed to delete blog:', error);
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
                fetchBlogs();
            }
        } catch (error) {
            console.error('Failed to toggle featured:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Blogs</h1>
                <Link href="/admin/blogs/create">
                    <Button>Create New Blog</Button>
                </Link>
            </div>

            <div className="mb-6 flex gap-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    All
                </Button>
                <Button
                    variant={filter === 'published' ? 'default' : 'outline'}
                    onClick={() => setFilter('published')}
                >
                    Published
                </Button>
                <Button
                    variant={filter === 'draft' ? 'default' : 'outline'}
                    onClick={() => setFilter('draft')}
                >
                    Drafts
                </Button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-4">
                    {blogs.map((blog) => (
                        <Card key={blog.id} className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                                    <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
                                        <span>Category: {blog.category.name}</span>
                                        <span>Access: {blog.accessType}</span>
                                        <span className={blog.published ? 'text-green-600' : 'text-yellow-600'}>
                                            {blog.published ? 'Published' : 'Draft'}
                                        </span>
                                        <span className={blog.featured ? 'text-purple-600 font-semibold' : 'text-gray-500'}>
                                            {blog.featured ? '⭐ Featured' : 'Not Featured'}
                                        </span>
                                    </div>
                                    {blog.publishedAt && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Published: {new Date(blog.publishedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        variant={blog.featured ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleToggleFeatured(blog.id, blog.featured)}
                                        className={blog.featured ? 'bg-purple-600 hover:bg-purple-700' : ''}
                                    >
                                        {blog.featured ? '⭐ Featured' : 'Mark Featured'}
                                    </Button>
                                    <Link href={`/admin/blogs/edit/${blog.id}`}>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(blog.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Delete
                                    </Button>
                                    <Link href={`/blogs/${blog.slug}`} target="_blank">
                                        <Button variant="outline" size="sm">View</Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {blogs.length === 0 && (
                        <Card className="p-8 text-center">
                            <p className="text-gray-600">No blogs found</p>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
