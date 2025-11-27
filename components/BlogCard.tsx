'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
    ArrowRight,
    Lock,
    Crown,
    Sparkles,
    Tag
} from 'lucide-react';

interface BlogCardProps {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    accessType: string;
    price: number | null;
    hasAccess?: boolean;
    category: {
        name: string;
        slug: string;
    };
}

export function BlogCard({
    title,
    slug,
    excerpt,
    coverImage,
    accessType,
    price,
    category,
    hasAccess = false,
}: BlogCardProps) {

    const getAccessBadge = () => {
        switch (accessType) {
            case 'FREE':
                return {
                    icon: Sparkles,
                    text: 'FREE',
                    className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white',
                    iconColor: 'text-white'
                };
            case 'PAID':
                return {
                    icon: Lock,
                    text: `₹${price}`,
                    className: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
                    iconColor: 'text-white'
                };
            case 'SUBSCRIPTION':
                return {
                    icon: Crown,
                    text: 'Premium',
                    className: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
                    iconColor: 'text-white'
                };
            default:
                return null;
        }
    };

    const badge = getAccessBadge();

    return (
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-[var(--custom-300)] h-full flex flex-col bg-white rounded-xl">
            {/* Image Container with Overlay */}
            <Link href={`/blogs/${slug}`} className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {coverImage ? (
                    <>
                        <Image
                            src={coverImage}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--custom-100)] to-[var(--custom-200)]">
                        <Tag className="w-16 h-16 text-[var(--custom-400)] opacity-50" />
                    </div>
                )}

                {/* Access Badge - Top Right */}
                {badge && (
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${badge.className} shadow-lg backdrop-blur-sm flex items-center gap-1.5 animate-in slide-in-from-top-2 duration-500`}>
                        <badge.icon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                        <span className="text-xs font-bold tracking-wide">{badge.text}</span>
                    </div>
                )}

                {/* Category Badge - Bottom Left */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-white/20 animate-in slide-in-from-bottom-2 duration-500">
                    <Link
                        href={`/blogs/category/${category.slug}`}
                        className="text-xs font-bold text-[var(--custom-600)] hover:text-[var(--custom-700)] uppercase tracking-wider transition-colors"
                    >
                        {category.name}
                    </Link>
                </div>

                {/* Read More Overlay - Appears on Hover */}
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
                {/* Title */}
                <Link href={`/blogs/${slug}`}>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 group-hover:text-[var(--custom-600)] transition-colors duration-300 leading-tight">
                        {title}
                    </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                    {excerpt || 'Discover insights and detailed information in this comprehensive article.'}
                </p>

                {/* Bottom Section */}
                <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-gray-100">


                    {/* CTA Button */}
                    <Link href={`/blogs/${slug}`} className="flex-1 max-w-[140px]">
                        <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-[var(--custom-600)] to-[var(--custom-700)] hover:from-[var(--custom-700)] hover:to-[var(--custom-800)] text-white shadow-md hover:shadow-xl transition-all duration-300 group/btn"
                        >
                            <span>Read More</span>
                            <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* Access Status Indicator */}
                {hasAccess && (
                    <div className="mt-3 px-3 py-2 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-green-700">You have access</span>
                    </div>
                )}
            </div>

            {/* Decorative Corner Accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[var(--custom-100)] to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </Card>
    );
}