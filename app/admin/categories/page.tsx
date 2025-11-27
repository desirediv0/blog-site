'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name),
        });
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', slug: '', description: '' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        setLoading(true);
        const loadingToast = toast.loading('Deleting category...');

        try {
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete category');
            }

            toast.success('Category deleted successfully!', { id: loadingToast });
            fetchCategories();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete category';
            toast.error(message, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.slug) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading(editingId ? 'Updating category...' : 'Creating category...');

        try {
            const url = editingId
                ? `/api/admin/categories/${editingId}`
                : '/api/admin/categories';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${editingId ? 'update' : 'create'} category`);
            }

            toast.success(`Category ${editingId ? 'updated' : 'created'} successfully!`, { id: loadingToast });
            setFormData({ name: '', slug: '', description: '' });
            setShowForm(false);
            setEditingId(null);
            fetchCategories();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : `Failed to ${editingId ? 'update' : 'create'} category`;
            toast.error(message, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Categories</h1>
                    <p className="text-gray-600">Manage content categories</p>
                </div>
                <Button
                    onClick={() => {
                        if (showForm) {
                            handleCancel();
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
                >
                    Create Category
                </Button>
            </div>

            {showForm && (
                <Card className="p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? 'Edit Category' : 'Create New Category'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Category name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Slug <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="category-slug"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Category description"
                                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--custom-500)]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
                            >
                                {editingId ? 'Update Category' : 'Create Category'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <Card key={category.id} className="p-6">
                        <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Slug: {category.slug}</p>
                        {category.description && (
                            <p className="text-sm text-gray-500 mb-4">{category.description}</p>
                        )}
                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(category)}
                                disabled={loading}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(category.id)}
                                disabled={loading}
                            >
                                Delete
                            </Button>
                        </div>
                    </Card>
                ))}

                {categories.length === 0 && !showForm && (
                    <Card className="p-8 text-center col-span-full">
                        <p className="text-gray-600">No categories found. Create your first category!</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
