'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';




export default function FeaturedStocksPage() {

    const [, setLoading] = useState(true);

    useEffect(() => {
        // For now, this is a placeholder - you can add stocks management later
        setLoading(false);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Featured Stocks</h1>
            <Card className="p-6">
                <p className="text-gray-600 mb-4">
                    Manage featured stocks that appear on the home page.
                </p>
                <p className="text-sm text-gray-500">
                    Stock management feature coming soon. For now, you can manage featured blogs and resources.
                </p>
            </Card>
        </div>
    );
}


