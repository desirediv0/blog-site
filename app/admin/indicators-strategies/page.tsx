'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Resource {
    id: string;
    title: string;
    slug: string;
    featured: boolean;
    published: boolean;
    category: {
        name: string;
    };
}

export default function IndicatorsStrategiesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/resources');
            if (response.ok) {
                const data = await response.json();
                // Filter for indicators and strategies
                const filtered = data.resources.filter((resource: Resource) =>
                    resource.category.name.toLowerCase().includes('indicator') ||
                    resource.category.name.toLowerCase().includes('strategy') ||
                    resource.category.name.toLowerCase().includes('trading')
                );
                setResources(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            toast.error('Failed to load resources');
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
                    type: 'RESOURCE',
                    id,
                    featured: !currentFeatured,
                }),
            });

            if (response.ok) {
                toast.success(currentFeatured ? 'Removed from featured' : 'Added to featured');
                fetchResources();
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
                <h1 className="text-3xl font-bold">Featured Indicators & Strategies</h1>
                <Link href="/admin/resources/create">
                    <Button>Create New Resource</Button>
                </Link>
            </div>

            <Card className="p-6 mb-6">
                <p className="text-gray-600">
                    Manage indicators and strategies that appear on the home page. Toggle featured status to show/hide resources.
                </p>
            </Card>

            {resources.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-600">No indicators or strategies found. Create resources in relevant categories.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {resources.map((resource) => (
                        <Card key={resource.id} className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{resource.title}</h3>
                                    <p className="text-sm text-gray-600">{resource.category.name}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`text-xs px-2 py-1 rounded ${resource.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {resource.published ? 'Published' : 'Draft'}
                                        </span>
                                        {resource.featured && (
                                            <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={resource.featured ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleToggleFeatured(resource.id, resource.featured)}
                                    >
                                        {resource.featured ? 'Remove from Featured' : 'Add to Featured'}
                                    </Button>
                                    <Link href={`/admin/resources/${resource.id}`}>
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



