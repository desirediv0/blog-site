'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BookOpen, FileText, User, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function MobileBottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdminPage = pathname?.startsWith('/admin');

    // Don't show on admin pages
    if (isAdminPage) {
        return null;
    }

    const navItems = [
        {
            href: '/',
            icon: Home,
            label: 'Home',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            activeGradient: 'from-blue-500 to-blue-600'
        },
        {
            href: '/blogs',
            icon: FileText,
            label: 'Blogs',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            activeGradient: 'from-purple-500 to-purple-600'
        },
        {
            href: '/resources/guides',
            icon: BookOpen,
            label: 'Resources',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            activeGradient: 'from-emerald-500 to-emerald-600'
        },
        {
            href: session ? '/user/profile' : '/auth/signin',
            icon: User,
            label: session ? 'Profile' : 'Sign In',
            color: 'text-[var(--custom-600)]',
            bgColor: 'bg-[var(--custom-50)]',
            activeGradient: 'from-[var(--custom-500)] to-[var(--custom-600)]'
        },
    ];

    return (
        <>
            {/* Spacer to prevent content from being hidden behind the nav */}
            <div className="h-20 lg:hidden" />

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl" />

                {/* Navigation Items */}
                <div className="relative flex items-center justify-around h-20 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname?.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center flex-1 h-full group"
                            >
                                {/* Active Indicator - Top Bar */}
                                {isActive && (
                                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r ${item.activeGradient} rounded-b-full animate-in slide-in-from-top-2 duration-300`} />
                                )}

                                {/* Icon Container */}
                                <div className="relative mb-1">
                                    {/* Background Circle - Active State */}
                                    {isActive && (
                                        <div className={`absolute inset-0 -m-2 ${item.bgColor} rounded-2xl animate-in zoom-in-75 duration-300`} />
                                    )}

                                    {/* Icon */}
                                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive
                                            ? `${item.color} scale-110`
                                            : 'text-gray-500 group-hover:text-gray-700 group-hover:scale-105'
                                        }`}>
                                        <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />

                                        {/* Sparkle effect for active item */}
                                        {isActive && (
                                            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-pulse" />
                                        )}
                                    </div>
                                </div>

                                {/* Label */}
                                <span className={`text-xs font-semibold transition-all duration-300 ${isActive
                                        ? `${item.color}`
                                        : 'text-gray-500 group-hover:text-gray-700'
                                    }`}>
                                    {item.label}
                                </span>

                                {/* Ripple effect on tap */}
                                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                    <div className={`absolute inset-0 ${item.bgColor} opacity-0 group-active:opacity-100 transition-opacity duration-150`} />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Safe area for phones with notches */}
                <div className="h-safe-area-inset-bottom bg-white/80 backdrop-blur-xl" />
            </nav>
        </>
    );
}