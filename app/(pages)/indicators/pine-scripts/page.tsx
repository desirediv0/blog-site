'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { ResourceCard } from '@/components/ResourceCard';
import { Card } from '@/components/ui/card';

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

export default function PineScriptLibrary() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await fetch('/api/resources?category=pine-scripts');
            if (response.ok) {
                const data = await response.json();
                setResources(data.resources);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
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
                Pine Script Library
            </h1>
            <p className="text-center text-gray-600 mb-8">
                Collection of Pine Script indicators and strategies
            </p>

            {resources.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-600">No Pine Scripts available yet</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((resource) => (
                        <ResourceCard key={resource.id} {...resource} />
                    ))}
                </div>
            )}
        </div>
    );
}

