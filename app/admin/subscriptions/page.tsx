'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

interface Subscription {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    cancelledAt: string | null;
    createdAt: string;
    razorpaySubscriptionId: string | null;
    user: {
        id: string;
        email: string;
        name: string | null;
    };
    payments: Array<{
        id: string;
        amount: number;
        createdAt: string;
    }>;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('/api/admin/subscriptions');
            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data.subscriptions);
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE').length;
    const cancelledSubscriptions = subscriptions.filter((s) => s.status === 'CANCELLED').length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Subscriptions Management</h1>
                <p className="text-gray-600">View and manage all subscription records</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Subscriptions</h3>
                    <p className="text-2xl font-bold">{subscriptions.length}</p>
                </Card>
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Active</h3>
                    <p className="text-2xl font-bold text-green-600">{activeSubscriptions}</p>
                </Card>
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Cancelled</h3>
                    <p className="text-2xl font-bold text-red-600">{cancelledSubscriptions}</p>
                </Card>
            </div>

            {/* Subscriptions Table */}
            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">User</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Start Date</th>
                                <th className="text-left p-3">End Date</th>
                                <th className="text-left p-3">Next Billing</th>
                                <th className="text-left p-3">Razorpay ID</th>
                                <th className="text-left p-3">Created</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((subscription) => (
                                <tr key={subscription.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div>
                                            <div className="font-medium">
                                                {subscription.user.name || subscription.user.email}
                                            </div>
                                            <div className="text-sm text-gray-500">{subscription.user.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${subscription.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : subscription.status === 'CANCELLED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {subscription.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm">
                                        {new Date(subscription.startDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 text-sm">
                                        {new Date(subscription.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 text-sm">
                                        {subscription.status === 'ACTIVE' && subscription.payments[0]
                                            ? new Date(
                                                new Date(subscription.payments[0].createdAt).setMonth(
                                                    new Date(subscription.payments[0].createdAt).getMonth() + 1
                                                )
                                            ).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td className="p-3 text-sm text-gray-600 font-mono">
                                        {subscription.razorpaySubscriptionId || '-'}
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {new Date(subscription.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            {subscription.status === 'ACTIVE' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        if (!confirm('Are you sure you want to cancel this subscription?')) return;
                                                        try {
                                                            const response = await fetch(`/api/subscriptions/${subscription.id}`, {
                                                                method: 'DELETE',
                                                            });
                                                            if (response.ok) {
                                                                toast.success('Subscription cancelled');
                                                                fetchSubscriptions();
                                                            } else {
                                                                toast.error('Failed to cancel subscription');
                                                            }
                                                        } catch (error) {
                                                            toast.error('Failed to cancel subscription');
                                                            console.error('Failed to cancel subscription:', error);
                                                        }
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {subscriptions.length === 0 && (
                    <div className="text-center py-8 text-gray-600">No subscriptions found</div>
                )}
            </Card>
        </div>
    );
}

