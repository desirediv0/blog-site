'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Tag {
    id: string;
    name: string;
    slug: string;
}

interface TagSelectorProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
    allowCreate?: boolean;
}

export function TagSelector({ selectedTags, onChange, allowCreate = true }: TagSelectorProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [newTagName, setNewTagName] = useState('');

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

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedTags.includes(tag.name)
    );

    const handleTagSelect = (tagName: string) => {
        if (!selectedTags.includes(tagName)) {
            onChange([...selectedTags, tagName]);
        }
        setSearchQuery('');
        setShowDropdown(false);
    };

    const handleTagRemove = (tagName: string) => {
        onChange(selectedTags.filter(t => t !== tagName));
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim() || !allowCreate) return;

        const tagName = newTagName.trim();
        if (selectedTags.includes(tagName)) {
            setNewTagName('');
            return;
        }

        try {
            const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const response = await fetch('/api/admin/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: tagName,
                    slug: slug,
                }),
            });

            if (response.ok) {
                onChange([...selectedTags, tagName]);
                setNewTagName('');
                fetchTags();
            }
        } catch (error) {
            console.error('Failed to create tag:', error);
        }
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search or type to create new tag"
                    className="w-full"
                />
                {showDropdown && (searchQuery || filteredTags.length > 0) && (
                    <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                        <div className="p-2">
                            {filteredTags.length > 0 && (
                                <div className="space-y-1">
                                    {filteredTags.slice(0, 10).map((tag) => (
                                        <Button
                                            key={tag.id}
                                            type="button"
                                            variant="ghost"
                                            className="w-full justify-start text-left"
                                            onClick={() => handleTagSelect(tag.name)}
                                        >
                                            {tag.name}
                                        </Button>
                                    ))}
                                </div>
                            )}
                            {allowCreate && searchQuery && !tags.find(t => t.name.toLowerCase() === searchQuery.toLowerCase()) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => {
                                        setNewTagName(searchQuery);
                                        handleCreateTag();
                                    }}
                                >
                                    Create &quot;{searchQuery}&quot;
                                </Button>
                            )}
                        </div>
                    </Card>
                )}
            </div>

            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map((tagName) => (
                        <span
                            key={tagName}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--custom-100)] text-[var(--custom-700)] rounded-full text-sm"
                        >
                            {tagName}
                            <button
                                type="button"
                                onClick={() => handleTagRemove(tagName)}
                                className="hover:text-red-600"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {showDropdown && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
}



