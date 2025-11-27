'use client';

import { usePathname } from 'next/navigation';
import { NavMenu } from '@/components/nav-menu';
import { Footer } from '@/components/footer';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    // Don't show header/footer for admin pages
    if (isAdminPage) {
        return <>{children}</>;
    }

    // Show header/footer for all other pages
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-white/50 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
                    <NavMenu />
                </div>
            </header>
            <main className="flex-grow pb-20 lg:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
        </div>
    );
}


