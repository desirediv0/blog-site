'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Copy, Trash2, RefreshCw } from 'lucide-react';

interface MediaFile {
    url: string;
    filename: string;
    key?: string;
    size?: number;
    uploadedAt: string;
}

export default function MediaPage() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchMediaFiles();
    }, []);

    const fetchMediaFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/media');
            if (response.ok) {
                const data = await response.json();
                setFiles(data.files || []);
            } else {
                toast.error('Failed to fetch media files');
            }
        } catch (error) {
            console.error('Failed to fetch media files:', error);
            toast.error('Failed to fetch media files');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        const loadingToast = toast.loading('Uploading image...');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            toast.success('Image uploaded successfully!', { id: loadingToast });

            // Refresh files list
            fetchMediaFiles();

            setSelectedFile(null);
            // Reset file input
            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to upload image';
            toast.error(message, { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard!');
    };

    const handleDelete = async (file: MediaFile) => {
        if (!confirm(`Are you sure you want to delete "${file.filename}"?`)) return;

        const loadingToast = toast.loading('Deleting file...');

        try {
            const response = await fetch('/api/admin/media', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: file.url,
                    key: file.key,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('File deleted successfully!', { id: loadingToast });
                fetchMediaFiles(); // Refresh list
            } else {
                toast.error(data.error || 'Failed to delete file', { id: loadingToast });
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete file', { id: loadingToast });
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Media Manager</h1>
                    <p className="text-gray-600">Upload and manage media files</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchMediaFiles}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Upload Section */}
            <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Upload New Image</h2>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Select Image</label>
                        <Input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />
                    </div>
                    <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
                {selectedFile && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Selected: {selectedFile.name}</p>
                        <div className="relative w-full max-w-md h-64 border rounded-lg overflow-hidden bg-gray-100">
                            <Image
                                src={URL.createObjectURL(selectedFile)}
                                alt="Preview"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Instructions */}
            <Card className="p-6 mb-6 bg-blue-50">
                <h3 className="font-semibold mb-2">How to use:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Upload an image using the form above</li>
                    <li>Copy the image URL from the uploaded file</li>
                    <li>Paste the URL in your blog editor or content</li>
                </ol>
            </Card>

            {/* Uploaded Files List */}
            {loading ? (
                <Card className="p-6">
                    <p className="text-gray-600 text-center">Loading media files...</p>
                </Card>
            ) : files.length > 0 ? (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">All Media Files ({files.length})</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {files.map((file, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
                                <div className="relative w-full h-48 bg-gray-100">
                                    <Image
                                        src={file.url}
                                        alt={file.filename}
                                        fill
                                        className="object-contain"
                                        unoptimized={file.url.startsWith('http')}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleCopyUrl(file.url)}
                                            >
                                                <Copy className="h-4 w-4 mr-1" />
                                                Copy
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(file)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium truncate mb-1" title={file.filename}>
                                        {file.filename}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-2">
                                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-xs"
                                            onClick={() => handleCopyUrl(file.url)}
                                        >
                                            <Copy className="h-3 w-3 mr-1" />
                                            URL
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="text-xs"
                                            onClick={() => handleDelete(file)}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 truncate" title={file.url}>
                                        {file.url}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            ) : (
                <Card className="p-6">
                    <p className="text-gray-600 text-center">
                        No media files found. Upload an image to get started.
                    </p>
                </Card>
            )}
        </div>
    );
}

