'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    banned: boolean;
    emailVerified: boolean;
    createdAt: string;
    _count: {
        blogPurchases: number;
        resourcePurchases: number;
        subscriptions: number;
    };
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBan = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ banned: !currentStatus }),
            });

            if (response.ok) {
                toast.success(currentStatus ? 'User unbanned successfully' : 'User banned successfully');
                fetchUsers();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update user');
            }
        } catch (error) {
            toast.error('Failed to update user');
            console.error('Failed to update user:', error);
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Users Management</h1>
                <p className="text-gray-600">Manage all platform users</p>
            </div>

            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">Email</th>
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Role</th>
                                <th className="text-left p-3">Verified</th>
                                <th className="text-left p-3">Purchases</th>
                                <th className="text-left p-3">Subscriptions</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Joined</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.name || '-'}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {user.emailVerified ? (
                                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {user._count.blogPurchases + user._count.resourcePurchases}
                                    </td>
                                    <td className="p-3">{user._count.subscriptions}</td>
                                    <td className="p-3">
                                        {user.banned ? (
                                            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                                                Banned
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-3">
                                        <Button
                                            variant={user.banned ? 'outline' : 'destructive'}
                                            size="sm"
                                            onClick={() => handleToggleBan(user.id, user.banned)}
                                        >
                                            {user.banned ? 'Unban' : 'Ban'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="text-center py-8 text-gray-600">No users found</div>
                )}
            </Card>
        </div>
    );
}



