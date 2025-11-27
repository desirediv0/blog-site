'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface Stats {
    totalUsers: number;
    totalBlogs: number;
    totalCategories: number;
    totalPayments: number;
    totalSubscriptions: number;
    revenue: number;
    monthlyEarnings: Array<{ month: string; amount: number }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600">Overview of your platform statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Users</h3>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.totalUsers || 0}</p>
                </Card>

                <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Blogs</h3>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.totalBlogs || 0}</p>
                </Card>

                <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Categories</h3>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.totalCategories || 0}</p>
                </Card>

                <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Purchases</h3>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.totalPayments || 0}</p>
                </Card>

                <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Revenue (INR)</h3>
                    <p className="text-2xl sm:text-3xl font-bold">₹{stats?.revenue.toFixed(2) || '0.00'}</p>
                </Card>

                <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Active Subscriptions</h3>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.totalSubscriptions || 0}</p>
                </Card>
            </div>

            {/* Monthly Earnings Chart */}
            {stats?.monthlyEarnings && stats.monthlyEarnings.length > 0 && (
                <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4">Monthly Earnings (Last 6 Months)</h2>
                    <div className="space-y-2">
                        {stats.monthlyEarnings.map((earning) => (
                            <div key={earning.month} className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-gray-600">{earning.month}</span>
                                <span className="text-sm sm:text-base font-semibold">₹{earning.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Blogs</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Create and manage blog posts</p>
                    <div className="space-y-2">
                        <Link href="/admin/blogs">
                            <Button className="w-full text-sm sm:text-base">Manage Blogs</Button>
                        </Link>
                        <Link href="/admin/blogs/create">
                            <Button variant="outline" className="w-full text-sm sm:text-base">Create New Blog</Button>
                        </Link>
                    </div>
                </Card>

                <Card className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Resources</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Create and manage resources</p>
                    <div className="space-y-2">
                        <Link href="/admin/resources">
                            <Button className="w-full text-sm sm:text-base">Manage Resources</Button>
                        </Link>
                        <Link href="/admin/resources/create">
                            <Button variant="outline" className="w-full text-sm sm:text-base">Create New Resource</Button>
                        </Link>
                    </div>
                </Card>

                <Card className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Categories</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Organize content with categories</p>
                    <Link href="/admin/categories">
                        <Button className="w-full text-sm sm:text-base">Manage Categories</Button>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
