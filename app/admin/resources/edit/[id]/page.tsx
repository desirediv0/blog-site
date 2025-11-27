'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/RichTextEditor';
import { TagSelector } from '@/components/tag-selector';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CodeBlock {
    id: string;
    language: string;
    code: string;
    title: string;
}

interface Resource {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    description: string;
    content?: string;
    coverImage: string;
    categoryId: string;
    accessType: string;
    price: number;
    isPublished: boolean;
    published?: boolean;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    keywords?: string[];
    codeBlocks: CodeBlock[];
    tags?: Array<{ name: string }>;
}

export default function EditResourcePage() {
    const { status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [categories, setCategories] = useState<Category[]>([]);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string>('');
    const [oldCoverImage, setOldCoverImage] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([
        { id: crypto.randomUUID(), language: 'javascript', code: '', title: '' }
    ]);

    const [formData, setFormData] = useState<Omit<Resource, 'tags'> & { tags: string[] }>({
        id: '',
        title: '',
        slug: '',
        excerpt: '',
        description: '',
        content: '',
        coverImage: '',
        categoryId: '',
        accessType: 'FREE',
        price: 0,
        isPublished: false,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        codeBlocks: [],
        tags: [],
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
        fetchCategories();
        fetchResource();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, params.id]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories');
            const data = await response.json();
            if (response.ok) {
                // API returns { categories: [...] }
                setCategories(data.categories || data || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
        });
    };

    const fetchResource = async () => {
        try {
            const response = await fetch(`/api/admin/resources/${params.id}`);
            const data = await response.json();

            if (response.ok) {
                const resource = data.resource || data;
                const coverImageUrl = resource.coverImage || '';

                setFormData({
                    id: resource.id || '',
                    title: resource.title || '',
                    slug: resource.slug || '',
                    excerpt: resource.excerpt || '',
                    description: resource.description || resource.content || '',
                    content: resource.content || resource.description || '',
                    coverImage: coverImageUrl,
                    categoryId: resource.categoryId || resource.category?.id || '',
                    accessType: resource.accessType || 'FREE',
                    price: resource.price || 0,
                    isPublished: resource.published || resource.isPublished || false,
                    metaTitle: resource.metaTitle || '',
                    metaDescription: resource.metaDescription || '',
                    metaKeywords: resource.keywords?.join(', ') || '',
                    codeBlocks: resource.codeBlocks || [],
                    tags: resource.tags?.map((tag: { name: string }) => tag.name) || [],
                });

                setCoverImagePreview(coverImageUrl);
                setOldCoverImage(coverImageUrl);

                if (resource.codeBlocks && Array.isArray(resource.codeBlocks) && resource.codeBlocks.length > 0) {
                    // Ensure codeBlocks have proper structure
                    const formattedCodeBlocks = resource.codeBlocks.map((block: Record<string, unknown>) => ({
                        id: block.id || crypto.randomUUID(),
                        language: block.language || 'javascript',
                        code: block.code || '',
                        title: block.title || '',
                    }));
                    setCodeBlocks(formattedCodeBlocks);
                } else {
                    setCodeBlocks([{ id: crypto.randomUUID(), language: 'javascript', code: '', title: '' }]);
                }
            } else {
                toast.error(data.error || 'Failed to fetch resource');
            }
        } catch (error) {
            console.error('Failed to fetch resource:', error);
            toast.error('Failed to fetch resource');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (): Promise<string> => {
        if (!coverImageFile) return formData.coverImage;

        const uploadFormData = new FormData();
        uploadFormData.append('file', coverImageFile);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await response.json();
            if (response.ok) {
                // Delete old image if exists
                if (oldCoverImage && oldCoverImage !== data.url) {
                    try {
                        await fetch('/api/upload/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: oldCoverImage }),
                        });
                    } catch (deleteError) {
                        console.error('Failed to delete old image:', deleteError);
                        // Don't fail the upload if delete fails
                    }
                }
                setOldCoverImage(data.url);
                return data.url;
            } else {
                toast.error(data.error || 'Failed to upload image');
                return formData.coverImage;
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
            return formData.coverImage;
        }
    };

    const handleRemoveImage = async () => {
        if (!formData.coverImage) return;

        if (confirm('Are you sure you want to remove this image?')) {
            try {
                // Delete from storage
                if (formData.coverImage) {
                    await fetch('/api/upload/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: formData.coverImage }),
                    });
                }
                setFormData((prev) => ({ ...prev, coverImage: '' }));
                setCoverImagePreview('');
                setOldCoverImage('');
                setCoverImageFile(null);
                toast.success('Image removed');
            } catch (error) {
                console.error('Failed to delete image:', error);
                // Still remove from form even if delete fails
                setFormData((prev) => ({ ...prev, coverImage: '' }));
                setCoverImagePreview('');
                setOldCoverImage('');
                setCoverImageFile(null);
            }
        }
    };

    const handleAddCodeBlock = () => {
        setCodeBlocks([
            ...codeBlocks,
            { id: crypto.randomUUID(), language: 'javascript', code: '', title: '' }
        ]);
    };

    const handleRemoveCodeBlock = (id: string) => {
        setCodeBlocks(codeBlocks.filter(block => block.id !== id));
    };

    const handleCodeBlockChange = (id: string, field: keyof CodeBlock, value: string) => {
        setCodeBlocks(codeBlocks.map(block =>
            block.id === id ? { ...block, [field]: value } : block
        ));
    };

    const handleUpdate = async () => {
        try {
            let coverImageUrl = formData.coverImage;

            if (coverImageFile) {
                toast.loading('Uploading image...');
                coverImageUrl = await uploadImage();
                toast.dismiss();
            } else if (oldCoverImage && !formData.coverImage) {
                // Image was removed
                try {
                    await fetch('/api/upload/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: oldCoverImage }),
                    });
                } catch (deleteError) {
                    console.error('Failed to delete old image:', deleteError);
                }
            }

            toast.loading('Updating resource...');

            const keywords = formData.metaKeywords
                ? formData.metaKeywords.split(',').map((k) => k.trim()).filter((k) => k.length > 0)
                : [];

            const response = await fetch(`/api/admin/resources/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    slug: formData.slug,
                    description: formData.description || formData.content || '',
                    content: formData.content || formData.description || '',
                    coverImage: coverImageUrl,
                    categoryId: formData.categoryId,
                    accessType: formData.accessType,
                    price: formData.accessType === 'PAID' ? Number(formData.price) : undefined,
                    published: formData.isPublished,
                    metaTitle: formData.metaTitle,
                    metaDescription: formData.metaDescription,
                    keywords,
                    codeBlocks: codeBlocks.filter(block => block.code.trim() !== ''),
                    tags: formData.tags || [],
                }),
            });

            toast.dismiss();

            if (response.ok) {
                toast.success('Resource updated successfully!');
                router.push('/admin/resources');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update resource');
            }
        } catch (error) {
            toast.dismiss();
            console.error('Failed to update resource:', error);
            toast.error('Failed to update resource');
        }
    };

    const togglePublish = async () => {
        try {
            toast.loading(formData.isPublished ? 'Unpublishing...' : 'Publishing...');

            const response = await fetch(`/api/admin/resources/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    isPublished: !formData.isPublished,
                    codeBlocks: codeBlocks.filter(block => block.code.trim() !== ''),
                }),
            });

            toast.dismiss();

            if (response.ok) {
                setFormData({ ...formData, isPublished: !formData.isPublished });
                toast.success(formData.isPublished ? 'Resource unpublished!' : 'Resource published!');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update status');
            }
        } catch (error) {
            toast.dismiss();
            console.error('Failed to toggle publish:', error);
            toast.error('Failed to update status');
        }
    };

    if (status === 'loading' || loading) {
        return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Edit Resource</h1>
                    <p className="text-gray-600">Update resource details and code blocks</p>
                </div>
                <Button onClick={togglePublish} variant={formData.isPublished ? 'outline' : 'default'}>
                    {formData.isPublished ? 'Unpublish' : 'Publish'}
                </Button>
            </div>

            <Card className="p-6">
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="Resource title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Slug</label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="resource-slug"
                                />
                                <p className="text-xs text-gray-500 mt-1">Auto-generated from title, but you can edit it</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Excerpt</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows={3}
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="Brief description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Cover Image</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {coverImagePreview && (
                                    <div className="mt-2 relative inline-block group">
                                        <Image
                                            src={coverImagePreview}
                                            alt="Preview"
                                            className="h-32 object-cover rounded border"
                                            width={1280}
                                            height={720}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Description/Content */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Description & Content</h2>
                        <RichTextEditor
                            key={formData.id} // Force re-render when resource changes
                            content={formData.content || formData.description || ''}
                            onChange={(html: string) => {
                                setFormData({
                                    ...formData,
                                    description: html,
                                    content: html
                                });
                            }}
                        />
                    </div>

                    {/* Code Blocks */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Code Blocks</h2>
                            <Button onClick={handleAddCodeBlock} variant="outline">
                                Add Code Block
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {codeBlocks.map((block, index) => (
                                <Card key={block.id} className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium">Code Block {index + 1}</h3>
                                        {codeBlocks.length > 1 && (
                                            <Button
                                                onClick={() => handleRemoveCodeBlock(block.id)}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Title</label>
                                            <Input
                                                value={block.title}
                                                onChange={(e) => handleCodeBlockChange(block.id, 'title', e.target.value)}
                                                placeholder="Code block title (optional)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Language</label>
                                            <select
                                                className="w-full px-3 py-2 border rounded-md"
                                                value={block.language}
                                                onChange={(e) => handleCodeBlockChange(block.id, 'language', e.target.value)}
                                            >
                                                <option value="javascript">JavaScript</option>
                                                <option value="typescript">TypeScript</option>
                                                <option value="python">Python</option>
                                                <option value="java">Java</option>
                                                <option value="cpp">C++</option>
                                                <option value="csharp">C#</option>
                                                <option value="php">PHP</option>
                                                <option value="ruby">Ruby</option>
                                                <option value="go">Go</option>
                                                <option value="rust">Rust</option>
                                                <option value="html">HTML</option>
                                                <option value="css">CSS</option>
                                                <option value="sql">SQL</option>
                                                <option value="bash">Bash</option>
                                                <option value="json">JSON</option>
                                                <option value="yaml">YAML</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Code</label>
                                            <textarea
                                                className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                                                rows={10}
                                                value={block.code}
                                                onChange={(e) => handleCodeBlockChange(block.id, 'code', e.target.value)}
                                                placeholder="Paste your code here..."
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Access Control */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Access Control</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Access Type</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={formData.accessType}
                                    onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                                >
                                    <option value="FREE">Free</option>
                                    <option value="PAID">Paid (One-time)</option>
                                    <option value="SUBSCRIPTION">Subscription</option>
                                </select>
                            </div>

                            {formData.accessType === 'PAID' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Price (₹)</label>
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">SEO</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Meta Title</label>
                                <Input
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                    placeholder="SEO title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Meta Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows={3}
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                    placeholder="SEO description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Meta Keywords</label>
                                <Input
                                    value={formData.metaKeywords}
                                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tags</label>
                                <TagSelector
                                    selectedTags={formData.tags}
                                    onChange={(tags) => setFormData({ ...formData, tags })}
                                    allowCreate={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <Button onClick={handleUpdate} className="w-full">
                            Update Resource
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
