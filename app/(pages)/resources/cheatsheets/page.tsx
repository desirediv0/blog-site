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

export default function CheatSheetsAndDownloads() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessType = params.get('accessType');
        fetchResources(accessType || undefined);
    }, []);

    const fetchResources = async (accessType?: string) => {
        try {
            const url = accessType
                ? `/api/resources?accessType=${accessType}`
                : '/api/resources?category=cheatsheets';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setResources(data.resources || []);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-2 text-center text-[var(--custom-500)]">
                    Cheat Sheets & Downloads
                </h1>
                <p className="text-[var(--custom-600)] text-center mb-8">
                    Download free trading resources and guides
                </p>

                {resources.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-600">No cheat sheets available yet</p>
                    </Card>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((resource) => (
                            <ResourceCard key={resource.id} {...resource} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}