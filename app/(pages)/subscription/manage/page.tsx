'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface Subscription {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    cancelledAt: string | null;
    razorpaySubscriptionId: string | null;
    price: number;
    plan: {
        id: string;
        name: string;
        duration: number;
        features: string[];
    } | null;
}

export default function ManageSubscription() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (status === 'authenticated') {
            fetchSubscription();
        }
    }, [status, router]);

    const fetchSubscription = async () => {
        try {
            const response = await fetch('/api/user/profile');
            if (response.ok) {
                const data = await response.json();
                const activeSubscription = data.user?.subscriptions?.find(
                    (sub: Subscription) => sub.status === 'ACTIVE' && !sub.cancelledAt
                );
                setSubscription(activeSubscription || null);
            }
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!subscription) return;

        if (!confirm('Are you sure you want to cancel your subscription?')) return;

        try {
            const response = await fetch(`/api/subscriptions/${subscription.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Subscription cancelled successfully');
                fetchSubscription();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            toast.error('Failed to cancel subscription');
            console.log("Failed to cancel subscription:", error);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">
                Manage Subscription
            </h1>

            {subscription ? (
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Your Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-2xl font-bold mb-2">
                                    {subscription.plan?.name || 'Premium Subscription'}
                                </p>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 text-sm rounded bg-green-100 text-green-800 font-medium">
                                        ACTIVE
                                    </span>
                                    <span className="text-lg font-semibold text-[var(--custom-600)]">
                                        ₹{subscription.price}
                                        {subscription.plan?.duration === 1 ? '/month' : subscription.plan?.duration === 12 ? '/year' : ` for ${subscription.plan?.duration} months`}
                                    </span>
                                </div>
                            </div>

                            {subscription.plan && subscription.plan.features.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium mb-2">Plan Features:</p>
                                    <ul className="space-y-1">
                                        {subscription.plan.features.map((feature, index) => (
                                            <li key={index} className="text-sm flex items-start">
                                                <span className="text-green-500 mr-2">✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">Start Date:</span>{' '}
                                    {new Date(subscription.startDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p>
                                    <span className="font-medium">End Date:</span>{' '}
                                    {new Date(subscription.endDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                {subscription.razorpaySubscriptionId && (
                                    <p className="text-gray-500 font-mono text-xs">
                                        ID: {subscription.razorpaySubscriptionId}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleCancel}
                                >
                                    Cancel Subscription
                                </Button>
                                <Button
                                    className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white"
                                    onClick={() => router.push('/subscription')}
                                >
                                    Change Plan
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>No Active Subscription</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-gray-600">
                            You don&apos;t have an active subscription. Subscribe now to access premium content!
                        </p>
                        <Button
                            className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
                            onClick={() => router.push('/subscription')}
                        >
                            Subscribe Now
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

