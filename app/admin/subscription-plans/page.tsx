'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number;
    features: string[];
    active: boolean;
}

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '1',
        features: '',
        active: true,
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/subscription-plans');
            if (response.ok) {
                const data = await response.json();
                setPlans(data.plans || []);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            toast.error('Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const features = formData.features
                .split('\n')
                .map(f => f.trim())
                .filter(f => f.length > 0);

            const response = await fetch('/api/admin/subscription-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    duration: parseInt(formData.duration),
                    features,
                    active: formData.active,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Subscription plan created successfully!');
                setShowCreateForm(false);
                resetForm();
                fetchPlans();
            } else {
                toast.error(data.error || 'Failed to create plan');
            }
        } catch (error) {
            console.error('Failed to create plan:', error);
            toast.error('Failed to create plan');
        }
    };

    const handleUpdate = async () => {
        if (!editingPlan || !formData.name || !formData.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const features = formData.features
                .split('\n')
                .map(f => f.trim())
                .filter(f => f.length > 0);

            const response = await fetch(`/api/admin/subscription-plans/${editingPlan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    duration: parseInt(formData.duration),
                    features,
                    active: formData.active,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Subscription plan updated successfully!');
                setEditingPlan(null);
                resetForm();
                fetchPlans();
            } else {
                toast.error(data.error || 'Failed to update plan');
            }
        } catch (error) {
            console.error('Failed to update plan:', error);
            toast.error('Failed to update plan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan? Active subscriptions will be preserved.')) return;

        try {
            const response = await fetch(`/api/admin/subscription-plans/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Plan deleted successfully');
                fetchPlans();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete plan');
            }
        } catch (error) {
            console.error('Failed to delete plan:', error);
            toast.error('Failed to delete plan');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration: '1',
            features: '',
            active: true,
        });
    };

    const startEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description || '',
            price: plan.price.toString(),
            duration: plan.duration.toString(),
            features: plan.features.join('\n'),
            active: plan.active,
        });
        setShowCreateForm(true);
    };

    const formatPrice = (price: number, duration: number) => {
        if (duration === 1) {
            return `₹${price}/month`;
        } else if (duration === 12) {
            return `₹${price}/year`;
        } else {
            return `₹${price} for ${duration} months`;
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
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
                    <p className="text-gray-600">Manage subscription plans and pricing</p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setEditingPlan(null);
                        setShowCreateForm(!showCreateForm);
                    }}
                >
                    {showCreateForm ? 'Cancel' : 'Create New Plan'}
                </Button>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
                <Card className="p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Plan Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Premium Monthly"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Duration (months) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="1">1 Month</option>
                                    <option value="3">3 Months</option>
                                    <option value="6">6 Months</option>
                                    <option value="12">12 Months (Yearly)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Description
                            </label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Plan description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="499"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Features <span className="text-red-500">*</span> (one per line)
                            </label>
                            <textarea
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                placeholder="Advanced market analysis&#10;Full access to trading resources&#10;Private forum access"
                                className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="active" className="text-sm font-medium">
                                Active (visible to users)
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={editingPlan ? handleUpdate : handleCreate}
                                className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white"
                            >
                                {editingPlan ? 'Update Plan' : 'Create Plan'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setEditingPlan(null);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Plans List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="text-2xl font-bold text-[var(--custom-600)] mt-2">
                                    {formatPrice(plan.price, plan.duration)}
                                </p>
                            </div>
                            <span
                                className={`px-2 py-1 text-xs rounded ${plan.active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {plan.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {plan.description && (
                            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                        )}

                        <ul className="mb-4 space-y-1">
                            {plan.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="text-sm flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                            {plan.features.length > 3 && (
                                <li className="text-sm text-gray-500">
                                    +{plan.features.length - 3} more features
                                </li>
                            )}
                        </ul>

                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEdit(plan)}
                                className="flex-1"
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(plan.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                Delete
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {plans.length === 0 && (
                <Card className="p-8 text-center">
                    <p className="text-gray-600">No subscription plans created yet</p>
                </Card>
            )}
        </div>
    );
}


