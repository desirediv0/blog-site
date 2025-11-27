'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    createdAt: string;
    user: {
        id: string;
        email: string;
        name: string | null;
    };
    subscription: {
        id: string;
        status: string;
    } | null;
    metadata: {
        type?: string;
        itemId?: string;
    } | null;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPayments = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.type) params.append('type', filters.type);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await fetch(`/api/admin/payments?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setPayments(data.payments);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const applyFilters = () => {
        setLoading(true);
        fetchPayments();
    };

    const clearFilters = () => {
        setFilters({ status: '', type: '', startDate: '', endDate: '' });
        setLoading(true);
        setTimeout(() => {
            fetchPayments();
        }, 100);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    const totalRevenue = payments
        .filter((p) => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Payments Management</h1>
                <p className="text-gray-600">View and manage all payment transactions</p>
            </div>

            {/* Filters */}
            <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md"
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="BLOG">Blog</option>
                            <option value="RESOURCE">Resource</option>
                            <option value="SUBSCRIPTION">Subscription</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <Button onClick={applyFilters}>Apply Filters</Button>
                    <Button variant="outline" onClick={clearFilters}>
                        Clear
                    </Button>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Payments</h3>
                    <p className="text-2xl font-bold">{payments.length}</p>
                </Card>
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                    <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                </Card>
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Successful</h3>
                    <p className="text-2xl font-bold">
                        {payments.filter((p) => p.status === 'SUCCESS').length}
                    </p>
                </Card>
            </div>

            {/* Payments Table */}
            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">User</th>
                                <th className="text-left p-3">Amount</th>
                                <th className="text-left p-3">Type</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Razorpay Order ID</th>
                                <th className="text-left p-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div>
                                            <div className="font-medium">{payment.user.name || payment.user.email}</div>
                                            <div className="text-sm text-gray-500">{payment.user.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-3 font-semibold">₹{payment.amount.toFixed(2)}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                            {payment.metadata?.type || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${payment.status === 'SUCCESS'
                                                ? 'bg-green-100 text-green-800'
                                                : payment.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {payment.razorpayOrderId || '-'}
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {new Date(payment.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {payments.length === 0 && (
                    <div className="text-center py-8 text-gray-600">No payments found</div>
                )}
            </Card>
        </div>
    );
}



