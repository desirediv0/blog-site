'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface Tag {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
    _count?: {
        blogs: number;
        resources: number;
    };
}

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/admin/tags');
            if (response.ok) {
                const data = await response.json();
                setTags(data.tags);
            }
        } catch (error) {
            console.error('Failed to fetch tags:', error);
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

    const handleEdit = (tag: Tag) => {
        setEditingId(tag.id);
        setFormData({
            name: tag.name,
            slug: tag.slug,
            description: tag.description || '',
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', slug: '', description: '' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tag? This will remove it from all blogs and resources.')) return;

        setLoading(true);
        const loadingToast = toast.loading('Deleting tag...');

        try {
            const response = await fetch(`/api/admin/tags/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete tag');
            }

            toast.success('Tag deleted successfully!', { id: loadingToast });
            fetchTags();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete tag';
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
        const loadingToast = toast.loading(editingId ? 'Updating tag...' : 'Creating tag...');

        try {
            const url = editingId
                ? `/api/admin/tags/${editingId}`
                : '/api/admin/tags';
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
                throw new Error(data.error || `Failed to ${editingId ? 'update' : 'create'} tag`);
            }

            toast.success(`Tag ${editingId ? 'updated' : 'created'} successfully!`, { id: loadingToast });
            setFormData({ name: '', slug: '', description: '' });
            setShowForm(false);
            setEditingId(null);
            fetchTags();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : `Failed to ${editingId ? 'update' : 'create'} tag`;
            toast.error(message, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Tags</h1>
                    <p className="text-gray-600">Manage tags for blogs and resources</p>
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
                    Create Tag
                </Button>
            </div>

            {showForm && (
                <Card className="p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? 'Edit Tag' : 'Create New Tag'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Tag name"
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
                                placeholder="tag-slug"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tag description"
                                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--custom-500)]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
                            >
                                {editingId ? 'Update Tag' : 'Create Tag'}
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
                {tags.map((tag) => (
                    <Card key={tag.id} className="p-6">
                        <h3 className="text-lg font-semibold mb-2">{tag.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Slug: {tag.slug}</p>
                        {tag.description && (
                            <p className="text-sm text-gray-500 mb-2">{tag.description}</p>
                        )}
                        {tag._count && (
                            <div className="text-sm text-gray-500 mb-4">
                                <span className="inline-block mr-4">
                                    {tag._count.blogs} blog{tag._count.blogs !== 1 ? 's' : ''}
                                </span>
                                <span className="inline-block">
                                    {tag._count.resources} resource{tag._count.resources !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(tag)}
                                disabled={loading}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(tag.id)}
                                disabled={loading}
                            >
                                Delete
                            </Button>
                        </div>
                    </Card>
                ))}

                {tags.length === 0 && !showForm && (
                    <Card className="p-8 text-center col-span-full">
                        <p className="text-gray-600">No tags found. Create your first tag!</p>
                    </Card>
                )}
            </div>
        </div>
    );
}


