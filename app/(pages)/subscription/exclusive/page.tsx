'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ResourceCard } from '@/components/ResourceCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

export default function ExclusiveResources() {
    const { data: session } = useSession();
    const router = useRouter();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExclusiveResources();
    }, [session]);

    const fetchExclusiveResources = async () => {
        try {
            const response = await fetch('/api/resources?accessType=SUBSCRIPTION');
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
                Exclusive Premium Resources
            </h1>
            <p className="text-center text-gray-600 mb-8">
                Access these exclusive resources with a premium subscription
            </p>

            {resources.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-600 mb-4">No exclusive resources available yet</p>
                    {!session && (
                        <Button
                            onClick={() => router.push('/subscription')}
                            className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
                        >
                            Subscribe Now
                        </Button>
                    )}
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

