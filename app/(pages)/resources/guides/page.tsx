'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResourceCard } from '@/components/ResourceCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, X, BookOpen, Filter } from 'lucide-react';

interface Resource {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string | null;
    accessType: string;
    price: number | null;
    hasAccess: boolean;
    category: {
        name: string;
        slug: string;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface PaginationInfo {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
}

function GuidesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [resources, setResources] = useState<Resource[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        totalPages: 1,
        total: 0,
        limit: 12
    });
    const [error, setError] = useState<string | null>(null);

    // Get URL params with memoization
    const filters = useMemo(() => ({
        accessType: searchParams.get('accessType') || '',
        categorySlug: searchParams.get('category') || '',
        page: parseInt(searchParams.get('page') || '1'),
        search: searchParams.get('search') || ''
    }), [searchParams]);

    // Fetch categories once on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch resources when filters change
    const fetchResources = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters.categorySlug) params.set('category', filters.categorySlug);
            if (filters.accessType) params.set('accessType', filters.accessType);
            if (filters.page > 1) params.set('page', filters.page.toString());
            if (filters.search) params.set('search', filters.search);

            const response = await fetch(`/api/resources?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch resources');

            const data = await response.json();
            setResources(data.resources || []);
            setPagination({
                page: data.pagination?.page || 1,
                totalPages: data.pagination?.totalPages || 1,
                total: data.pagination?.total || 0,
                limit: data.pagination?.limit || 12
            });
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            setError('Failed to load resources. Please try again.');
            setResources([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');

            const data = await response.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const updateURLParams = useCallback((updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Reset to page 1 when filters change
        if ('page' in updates === false) {
            params.delete('page');
        }

        router.push(`?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        updateURLParams({ [key]: value });
    }, [updateURLParams]);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        updateURLParams({ search: searchQuery.trim() });
    }, [searchQuery, updateURLParams]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        updateURLParams({ search: '' });
    }, [updateURLParams]);

    const handlePageChange = useCallback((newPage: number) => {
        updateURLParams({ page: newPage.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [updateURLParams]);

    const handleClearAllFilters = useCallback(() => {
        setSearchQuery('');
        router.push('/guides', { scroll: false });
    }, [router]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() =>
        filters.search || filters.categorySlug || filters.accessType,
        [filters]
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <BookOpen className="w-10 h-10 text-[var(--custom-600)]" />
                    <h1 className="text-4xl font-bold text-[var(--custom-500)]">
                        Guides & Ebooks
                    </h1>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    Comprehensive guides and ebooks to help you master trading strategies and techniques
                </p>
            </div>

            {/* Filters and Search */}
            <Card className="p-6 mb-8 shadow-sm">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search guides and ebooks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" className="min-w-[100px]">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                        {filters.search && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearSearch}
                                className="min-w-[100px]"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </form>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                                <Filter className="w-4 h-4" />
                                Category
                            </label>
                            <Select
                                value={filters.categorySlug || 'all'}
                                onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}
                                disabled={categoriesLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.slug}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                                <Filter className="w-4 h-4" />
                                Access Type
                            </label>
                            <Select
                                value={filters.accessType || 'all'}
                                onValueChange={(value) => handleFilterChange('accessType', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="FREE">Free</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Clear All Filters Button */}
                    {hasActiveFilters && (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAllFilters}
                                className="text-sm"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="p-6 mb-8 bg-red-50 border-red-200">
                    <p className="text-red-600 text-center">{error}</p>
                    <div className="flex justify-center mt-4">
                        <Button onClick={fetchResources} variant="outline">
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-[var(--custom-600)] mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading guides and ebooks...</p>
                </div>
            ) : resources.length === 0 ? (
                /* Empty State */
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-4">
                            {filters.search
                                ? `No guides found for "${filters.search}"`
                                : hasActiveFilters
                                    ? 'No guides match your filters'
                                    : 'No guides available yet'}
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                            {filters.search || hasActiveFilters
                                ? 'Try adjusting your search or filters'
                                : 'Check back soon for new trading guides and ebooks'}
                        </p>
                        {hasActiveFilters && (
                            <Button onClick={handleClearAllFilters} variant="outline">
                                <X className="w-4 h-4 mr-2" />
                                Clear all filters
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                /* Resources Grid */
                <>
                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-medium">{resources.length}</span> of{' '}
                            <span className="font-medium">{pagination.total}</span> guides
                            {filters.search && (
                                <span className="ml-1">
                                    for &quot;<span className="font-medium">{filters.search}</span>&quot;
                                </span>
                            )}
                        </p>

                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                                <Filter className="w-3 h-3" />
                                <span>Filters active</span>
                            </div>
                        )}
                    </div>

                    {/* Resource Cards Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {resources.map((resource) => (
                            <ResourceCard key={resource.id} {...resource} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <Card className="p-4">
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="min-w-[120px]"
                                >
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    {/* Page Numbers */}
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter(pageNum => {
                                            // Show first page, last page, current page, and neighbors
                                            return (
                                                pageNum === 1 ||
                                                pageNum === pagination.totalPages ||
                                                Math.abs(pageNum - pagination.page) <= 1
                                            );
                                        })
                                        .map((pageNum, idx, arr) => {
                                            // Add ellipsis if there's a gap
                                            const showEllipsisBefore = idx > 0 && pageNum - arr[idx - 1] > 1;

                                            return (
                                                <div key={pageNum} className="flex items-center gap-2">
                                                    {showEllipsisBefore && (
                                                        <span className="px-2 text-gray-400">...</span>
                                                    )}
                                                    <Button
                                                        variant={pageNum === pagination.page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className="min-w-[40px]"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="min-w-[120px]"
                                >
                                    Next
                                </Button>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

export default function GuidesAndEbooks() {
    return (
        <Suspense
            fallback={
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center py-16">
                        <Loader2 className="h-12 w-12 animate-spin text-[var(--custom-600)] mx-auto mb-4" />
                        <p className="text-gray-600">Loading guides and ebooks...</p>
                    </div>
                </div>
            }
        >
            <GuidesContent />
        </Suspense>
    );
}