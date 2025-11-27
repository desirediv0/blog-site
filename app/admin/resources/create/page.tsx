'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

export default function CreateResourcePage() {
    const { status } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string>('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([
        { id: crypto.randomUUID(), language: 'javascript', code: '', title: '' }
    ]);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        description: '',
        coverImage: '',
        categoryId: '',
        accessType: 'FREE',
        price: 0,
        isPublished: false,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        tags: [] as string[],
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
        fetchCategories();
    }, [status, router]);

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

    const handleTitleChange = (value: string) => {
        setFormData({
            ...formData,
            title: value,
            slug: generateSlug(value),
        });
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
        if (!coverImageFile) return '';

        const formData = new FormData();
        formData.append('file', coverImageFile);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setUploadedImageUrl(data.url); // Store for cleanup if needed
                return data.url;
            } else {
                toast.error(data.error || 'Failed to upload image');
                return '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
            return '';
        }
    };

    const deleteUploadedImage = async (imageUrl: string) => {
        try {
            await fetch('/api/upload/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: imageUrl }),
            });
        } catch (error) {
            console.error('Failed to delete uploaded image:', error);
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

    const handleSubmit = async (publish: boolean) => {
        try {
            let coverImageUrl = formData.coverImage;

            if (coverImageFile) {
                toast.loading('Uploading image...');
                coverImageUrl = await uploadImage();
                toast.dismiss();

                if (!coverImageUrl) return;
            }

            toast.loading(publish ? 'Publishing resource...' : 'Saving draft...');

            const response = await fetch('/api/admin/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    content: formData.description, // Use description as content (Prisma requires both)
                    coverImage: coverImageUrl,
                    isPublished: publish,
                    price: Number(formData.price),
                    codeBlocks: codeBlocks.filter(block => block.code.trim() !== ''),
                    tags: formData.tags || [],
                }),
            });

            toast.dismiss();

            if (response.ok) {
                // Success - clear uploaded image URL
                setUploadedImageUrl(null);
                toast.success(publish ? 'Resource published!' : 'Draft saved!');
                router.push('/admin/resources');
            } else {
                const data = await response.json();

                // If resource creation failed and we uploaded an image, delete it
                if (uploadedImageUrl && coverImageUrl === uploadedImageUrl) {
                    await deleteUploadedImage(uploadedImageUrl);
                    setFormData((prev) => ({ ...prev, coverImage: '' }));
                    setUploadedImageUrl(null);
                    setCoverImageFile(null);
                    setCoverImagePreview('');
                }

                toast.error(data.error || 'Failed to create resource');
            }
        } catch (error) {
            toast.dismiss();
            console.error('Failed to create resource:', error);
            toast.error('Failed to create resource');
        }
    };

    if (status === 'loading') {
        return <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create New Resource</h1>
                <p className="text-sm sm:text-base text-gray-600">Add a new resource with code blocks</p>
            </div>

            <Card className="p-4 sm:p-6">
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
                                    <div className="mt-2">
                                        <Image
                                            src={coverImagePreview}
                                            alt="Preview"
                                            className="h-32 object-cover rounded"
                                            width={1280}
                                            height={720}
                                        />
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

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Description</h2>
                        <RichTextEditor
                            content={formData.description}
                            onChange={(html) => setFormData({ ...formData, description: html })}
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
                    <div className="flex gap-4">
                        <Button onClick={() => handleSubmit(false)} variant="outline">
                            Save as Draft
                        </Button>
                        <Button onClick={() => handleSubmit(true)}>
                            Publish Resource
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
