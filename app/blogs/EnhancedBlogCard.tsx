import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import {
    BookOpen,
    Calendar,
    User,
    ArrowRight,
    Lock,
    Crown,
    Sparkles,
    Tag
} from 'lucide-react';

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    accessType: 'FREE' | 'PAID' | 'SUBSCRIPTION';
    price?: number | null;
    publishedAt?: string | null;
    category?: {
        name: string;
    } | null;
    author?: {
        name: string | null;
    } | null;
    tags?: Array<{
        id: string;
        name: string;
    }> | null;
}

export function EnhancedBlogCard({ blog }: { blog: Blog }) {
    const getAccessBadge = () => {
        switch (blog.accessType) {
            case 'FREE':
                return {
                    icon: Sparkles,
                    text: 'FREE',
                    className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg',
                };
            case 'PAID':
                return {
                    icon: Lock,
                    text: `₹${blog.price}`,
                    className: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg',
                };
            case 'SUBSCRIPTION':
                return {
                    icon: Crown,
                    text: 'Premium',
                    className: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg',
                };
            default:
                return null;
        }
    };

    const badge = getAccessBadge();

    return (
        <Card
            key={blog.id}
            className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-[var(--custom-300)] h-full flex flex-col rounded-2xl"
        >
            {/* Image Section */}
            <Link href={`/blogs/${blog.slug}`} className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {blog.coverImage ? (
                    <>
                        <Image
                            src={blog.coverImage}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            unoptimized={blog.coverImage.startsWith('http')}
                        />
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--custom-100)] to-[var(--custom-200)] flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-[var(--custom-400)] opacity-50" />
                    </div>
                )}

                {/* Access Badge - Top Right */}
                {badge && (
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${badge.className} backdrop-blur-sm flex items-center gap-1.5 animate-in slide-in-from-top-2 duration-500`}>
                        <badge.icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold tracking-wide">{badge.text}</span>
                    </div>
                )}

                {/* Category Badge - Bottom Left */}
                {blog.category && (
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-white/20">
                        <span className="text-xs font-bold text-[var(--custom-600)] uppercase tracking-wider">
                            {blog.category.name}
                        </span>
                    </div>
                )}

                {/* Read More Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="text-[var(--custom-600)] font-bold flex items-center gap-2">
                            Read Article
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </Link>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow">
                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.slice(0, 3).map((tag: { id: string; name: string }) => (
                            <span
                                key={tag.id}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors cursor-pointer"
                            >
                                <Tag className="w-3 h-3" />
                                {tag.name}
                            </span>
                        ))}
                        {blog.tags.length > 3 && (
                            <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                                +{blog.tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Title */}
                <Link href={`/blogs/${blog.slug}`}>
                    <h2 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 group-hover:text-[var(--custom-600)] transition-colors duration-300 leading-tight">
                        {blog.title}
                    </h2>
                </Link>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                    {blog.excerpt || 'Discover insights and detailed information in this comprehensive article.'}
                </p>

                {/* Bottom Section */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        {/* Author */}
                        {blog.author && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="p-1.5 bg-gray-100 rounded-full">
                                    <User className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-medium truncate max-w-[120px]">
                                    {blog.author.name || 'Unknown'}
                                </span>
                            </div>
                        )}

                        {/* Published Date */}
                        {blog.publishedAt && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">
                                    {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CTA Button */}
                    <Link href={`/blogs/${blog.slug}`} className="block">
                        <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-[var(--custom-600)] to-[var(--custom-700)] hover:from-[var(--custom-700)] hover:to-[var(--custom-800)] text-white shadow-md hover:shadow-xl transition-all duration-300 group/btn"
                        >
                            <span>Read Full Article</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Decorative Corner Accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[var(--custom-100)] to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </Card>
    );
}