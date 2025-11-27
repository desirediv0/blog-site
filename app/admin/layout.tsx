"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Users,
  CreditCard,
  Repeat,
  Image as ImageIcon,
  Settings,
  Menu,
  BookOpen,
  TrendingUp,
  BarChart3,
  Newspaper,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminHeader } from "@/components/admin-header";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/resources", label: "Resources", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  {
    href: "/admin/featured-stocks",
    label: "Featured Stocks",
    icon: TrendingUp,
  },
  {
    href: "/admin/live-insights",
    label: "Live Market Insights",
    icon: BarChart3,
  },
  {
    href: "/admin/articles-commentary",
    label: "Articles & Commentary",
    icon: Newspaper,
  },
  {
    href: "/admin/indicators-strategies",
    label: "Indicators & Strategies",
    icon: BarChart3,
  },
  {
    href: "/admin/subscription-plans",
    label: "Subscription Plans",
    icon: Repeat,
  },
  { href: "/admin/subscriptions", label: "User Subscriptions", icon: Repeat },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/media", label: "Media Manager", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // Only redirect if we're sure user is not admin (after loading)
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Show loading only while checking auth
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated but not admin, show loading (redirect is happening)
  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <AdminHeader />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-40 bg-white border-r mt-16">
          <div className="flex flex-col flex-1 overflow-y-auto">
            <SidebarContent pathname={pathname} />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-white">
              <div className="bg-white h-full">
                <SidebarContent
                  pathname={pathname}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64 mt-16">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4 bg-white">
      <div className="px-3 py-2 mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Navigation
        </h2>
      </div>
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--custom-50)] text-[var(--custom-700)] font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
