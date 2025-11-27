'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
    Lock,
    CheckCircle,
    Crown,
    CreditCard,
    Eye,
    Tag,
    ExternalLink
} from 'lucide-react';
import { memo, useCallback } from 'react';

interface ResourceCardProps {
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

function ResourceCardComponent({
    title,
    slug,
    description,
    coverImage,
    accessType,
    price,
    hasAccess,
    category,
}: ResourceCardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handlePurchase = useCallback(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push(`/auth/signin?callbackUrl=/resources/${slug}`);
            return;
        }
        router.push(`/resources/${slug}`);
    }, [session, status, router, slug]);

    const handleSubscribe = useCallback(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push(`/auth/signin?callbackUrl=/subscription/compare`);
            return;
        }
        router.push('/subscription/compare');
    }, [session, status, router]);

    // Strip HTML tags and truncate description
    const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
    const truncatedDescription = cleanDescription.length > 120
        ? `${cleanDescription.substring(0, 120)}...`
        : cleanDescription;

    // Access Type Badge Component
    const AccessBadge = useCallback(() => {
        switch (accessType) {
            case 'FREE':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Free
                    </Badge>
                );
            case 'PAID':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                        <CreditCard className="w-3 h-3 mr-1" />
                        ₹{price}
                    </Badge>
                );
            case 'SUBSCRIPTION':
                return (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                    </Badge>
                );
            default:
                return null;
        }
    }, [accessType, price]);

    return (
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 h-full flex flex-col bg-white">
            {/* Cover Image */}
            <Link href={`/resources/${slug}`} className="block">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Tag className="w-12 h-12 text-gray-400" />
                        </div>
                    )}

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Eye className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                    </div>

                    {/* Owned Badge Overlay */}
                    {hasAccess && (
                        <div className="absolute top-3 right-3">
                            <Badge className="bg-blue-600 text-white hover:bg-blue-600 shadow-lg">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Owned
                            </Badge>
                        </div>
                    )}
                </div>
            </Link>

            {/* Card Content */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Category and Access Type */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge
                        variant="outline"
                        className="text-[var(--custom-600)] border-[var(--custom-600)] hover:bg-[var(--custom-50)]"
                    >
                        <Tag className="w-3 h-3 mr-1" />
                        {category.name}
                    </Badge>
                    <AccessBadge />
                </div>

                {/* Title */}
                <Link href={`/resources/${slug}`}>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-[var(--custom-600)] transition-colors min-h-[3.5rem]">
                        {title}
                    </h3>
                </Link>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                    {truncatedDescription}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                    {hasAccess ? (
                        // User owns this resource
                        <Link href={`/resources/${slug}`} className="flex-1">
                            <Button
                                className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white shadow-sm"
                                size="lg"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Resource
                            </Button>
                        </Link>
                    ) : accessType === 'FREE' ? (
                        // Free resource
                        <Link href={`/resources/${slug}`} className="flex-1">
                            <Button
                                className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white shadow-sm"
                                size="lg"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Free
                            </Button>
                        </Link>
                    ) : (
                        // Locked resource
                        <>
                            {!session ? (
                                // Not logged in
                                <>
                                    <Link href={`/resources/${slug}`} className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            size="lg"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="default"
                                        onClick={() => router.push(`/auth/signin?callbackUrl=/resources/${slug}`)}
                                        className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
                                        size="lg"
                                    >
                                        <Lock className="w-4 h-4" />
                                    </Button>
                                </>
                            ) : accessType === 'PAID' ? (
                                // Paid resource - logged in user
                                <>
                                    <Link href={`/resources/${slug}`} className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            size="lg"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={handlePurchase}
                                        className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white shadow-sm min-w-[120px]"
                                        size="lg"
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        ₹{price}
                                    </Button>
                                </>
                            ) : (
                                // Subscription resource - logged in user
                                <>
                                    <Link href={`/resources/${slug}`} className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            size="lg"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={handleSubscribe}
                                        className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white shadow-sm min-w-[120px]"
                                        size="lg"
                                    >
                                        <Crown className="w-4 h-4 mr-2" />
                                        Subscribe
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}

export const ResourceCard = memo(ResourceCardComponent);
ResourceCard.displayName = 'ResourceCard';