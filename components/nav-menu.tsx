"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  BookOpen,
  Users,
  User,
  Menu,
  LogOut,
  FileText,
  IndianRupee,
  Crown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  accessType: string;
}

interface Resource {
  id: string;
  title: string;
  slug: string;
  accessType: string;
}

const staticMenuItems = [
  {
    title: "Subscription",
    icon: Users,
    items: [
      {
        name: "Manage Subscription",
        icon: BookOpen,
        href: "/subscription/manage",
        description: "View and manage your subscription plans"
      },
      {
        name: "Exclusive Resources",
        icon: Sparkles,
        href: "/subscription/exclusive",
        description: "Access premium subscriber content"
      },
    ],
  },
];

const Logo = () => (
  <Link href="/" className="flex items-center">
    <div className="hidden lg:block">
      <Image
        src="/bg.png"
        alt="Desktop Logo"
        width={120}
        height={40}
        priority
        className="object-contain"
      />
    </div>
    <div className="lg:hidden">
      <Image
        src="/bg-mob.png"
        alt="Mobile Logo"
        width={50}
        height={50}
        priority
        className="object-contain"
      />
    </div>
  </Link>
);

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [freeBlogs, setFreeBlogs] = useState<Blog[]>([]);
  const [paidBlogs, setPaidBlogs] = useState<Blog[]>([]);
  const [subscriptionBlogs, setSubscriptionBlogs] = useState<Blog[]>([]);
  const [freeResources, setFreeResources] = useState<Resource[]>([]);
  const [paidResources, setPaidResources] = useState<Resource[]>([]);
  const [subscriptionResources, setSubscriptionResources] = useState<Resource[]>([]);

  useEffect(() => {
    fetch("/api/blogs?accessType=FREE&limit=5")
      .then((res) => res.json())
      .then((data) => setFreeBlogs(data.blogs || []))
      .catch(() => setFreeBlogs([]));

    fetch("/api/blogs?accessType=PAID&limit=5")
      .then((res) => res.json())
      .then((data) => setPaidBlogs(data.blogs || []))
      .catch(() => setPaidBlogs([]));

    fetch("/api/blogs?accessType=SUBSCRIPTION&limit=5")
      .then((res) => res.json())
      .then((data) => setSubscriptionBlogs(data.blogs || []))
      .catch(() => setSubscriptionBlogs([]));

    fetch("/api/resources?accessType=FREE&limit=5")
      .then((res) => res.json())
      .then((data) => setFreeResources(data.resources || []))
      .catch(() => setFreeResources([]));

    fetch("/api/resources?accessType=PAID&limit=5")
      .then((res) => res.json())
      .then((data) => setPaidResources(data.resources || []))
      .catch(() => setPaidResources([]));

    fetch("/api/resources?accessType=SUBSCRIPTION&limit=5")
      .then((res) => res.json())
      .then((data) => setSubscriptionResources(data.resources || []))
      .catch(() => setSubscriptionResources([]));
  }, []);

  const MobileMenu = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label="Open navigation menu"
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-[var(--custom-50)]"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[350px] bg-white max-h-screen overflow-y-auto"
      >
        <nav className="flex flex-col gap-6 p-4 pb-8 mt-6">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 text-base font-semibold text-[var(--custom-600)] hover:text-[var(--custom-700)] transition-colors p-3 rounded-lg hover:bg-[var(--custom-50)]"
          >
            <Home className="w-5 h-5" />
            HOME
          </Link>

          {/* Blogs Section */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 px-3">
              <FileText className="w-5 h-5 text-[var(--custom-600)]" />
              Blogs
            </h2>
            <div className="space-y-1">
              <Link
                href="/blogs?accessType=FREE"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-3 text-gray-700 hover:text-[var(--custom-600)] hover:bg-[var(--custom-50)] transition-all p-3 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Free Blogs</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href="/blogs?accessType=PAID"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-3 text-gray-700 hover:text-[var(--custom-600)] hover:bg-[var(--custom-50)] transition-all p-3 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <IndianRupee className="w-4 h-4" />
                  <span className="font-medium">Paid Blogs</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href="/blogs?accessType=SUBSCRIPTION"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-3 text-gray-700 hover:text-[var(--custom-600)] hover:bg-[var(--custom-50)] transition-all p-3 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">Premium Blogs</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Resources Section */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 px-3">
              <BookOpen className="w-5 h-5 text-[var(--custom-600)]" />
              Resources
            </h2>
            <div className="space-y-1">
              <Link
                href="/resources/guides?accessType=FREE"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-3 text-gray-700 hover:text-[var(--custom-600)] hover:bg-[var(--custom-50)] transition-all p-3 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Free Resources</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href="/resources/guides?accessType=PAID"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-3 text-gray-700 hover:text-[var(--custom-600)] hover:bg-[var(--custom-50)] transition-all p-3 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <IndianRupee className="w-4 h-4" />
                  <span className="font-medium">Paid Resources</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href="/resources/guides?accessType=SUBSCRIPTION"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-3 text-gray-700 hover:text-[var(--custom-600)] hover:bg-[var(--custom-50)] transition-all p-3 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">Premium Resources</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Static Menu Items */}
          {staticMenuItems.map((item) => (
            <div key={item.title} className="space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 px-3">
                <item.icon className="w-5 h-5 text-[var(--custom-600)]" />
                {item.title}
              </h2>
              <div className="space-y-1">
                {item.items.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between gap-3 text-gray-700 hover:text-[var(--custom-600)] hover:bg-[var(--custom-50)] transition-all p-3 rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <subItem.icon className="w-4 h-4" />
                      <span className="font-medium">{subItem.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );

  const DesktopMenu = () => (
    <NavigationMenu className="hidden lg:block">
      <NavigationMenuList>
        {/* Blogs Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2 text-gray-700 hover:text-[var(--custom-600)] font-medium">
            <FileText className="w-4 h-4" />
            Blogs
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[450px] gap-3 p-4 lg:w-[650px] lg:grid-cols-[1fr_1fr]">
              <li className="row-span-4">
                <NavigationMenuLink asChild>
                  <Link
                    href="/blogs"
                    className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-br from-[var(--custom-500)] via-[var(--custom-600)] to-[var(--custom-700)] p-6 no-underline outline-none focus:shadow-md hover:shadow-lg transition-all relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <FileText className="h-24 w-24 text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="mb-2 text-xl font-bold text-white">All Blogs</div>
                      <p className="text-sm leading-relaxed text-white/90">
                        Explore our complete collection of insights, articles, and stories
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-white/90 text-sm font-medium">
                        <span>Browse all</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/blogs?accessType=FREE"
                    className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-[var(--custom-50)] hover:shadow-md border-2 border-transparent hover:border-[var(--custom-200)] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold leading-none text-gray-900 mb-1">
                          Free Blogs
                        </div>
                        <p className="text-xs text-gray-500">
                          {freeBlogs.length} articles available
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--custom-600)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/blogs?accessType=PAID"
                    className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-[var(--custom-50)] hover:shadow-md border-2 border-transparent hover:border-[var(--custom-200)] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <IndianRupee className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold leading-none text-gray-900 mb-1">
                          Paid Blogs
                        </div>
                        <p className="text-xs text-gray-500">
                          {paidBlogs.length} premium articles
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--custom-600)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/blogs?accessType=SUBSCRIPTION"
                    className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-amber-50 hover:shadow-md border-2 border-transparent hover:border-amber-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                        <Crown className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold leading-none text-gray-900 mb-1 flex items-center gap-1">
                          Premium Blogs
                          <Sparkles className="w-3 h-3 text-amber-500" />
                        </div>
                        <p className="text-xs text-gray-500">
                          {subscriptionBlogs.length} exclusive articles
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Resources Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2 text-gray-700 hover:text-[var(--custom-600)] font-medium">
            <BookOpen className="w-4 h-4" />
            Resources
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[450px] gap-3 p-4 lg:w-[650px] lg:grid-cols-[1fr_1fr]">
              <li className="row-span-4">
                <NavigationMenuLink asChild>
                  <Link
                    href="/resources/guides"
                    className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 p-6 no-underline outline-none focus:shadow-md hover:shadow-lg transition-all relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <BookOpen className="h-24 w-24 text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="mb-2 text-xl font-bold text-white">
                        All Resources
                      </div>
                      <p className="text-sm leading-relaxed text-white/90">
                        Access comprehensive guides, tools, and learning materials
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-white/90 text-sm font-medium">
                        <span>Explore resources</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/resources/guides?accessType=FREE"
                    className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-purple-50 hover:shadow-md border-2 border-transparent hover:border-purple-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold leading-none text-gray-900 mb-1">
                          Free Resources
                        </div>
                        <p className="text-xs text-gray-500">
                          {freeResources.length} resources available
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/resources/guides?accessType=PAID"
                    className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-purple-50 hover:shadow-md border-2 border-transparent hover:border-purple-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <IndianRupee className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold leading-none text-gray-900 mb-1">
                          Paid Resources
                        </div>
                        <p className="text-xs text-gray-500">
                          {paidResources.length} premium resources
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/resources/guides?accessType=SUBSCRIPTION"
                    className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-amber-50 hover:shadow-md border-2 border-transparent hover:border-amber-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                        <Crown className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold leading-none text-gray-900 mb-1 flex items-center gap-1">
                          Premium Resources
                          <Sparkles className="w-3 h-3 text-amber-500" />
                        </div>
                        <p className="text-xs text-gray-500">
                          {subscriptionResources.length} exclusive resources
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Static Menu Items */}
        {staticMenuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuTrigger className="flex items-center gap-2 text-gray-700 hover:text-[var(--custom-600)] font-medium">
              <item.icon className="w-4 h-4" />
              {item.title}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4">
                {item.items.map((subItem) => (
                  <li key={subItem.name}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={subItem.href}
                        className="block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-[var(--custom-50)] hover:shadow-md border-2 border-transparent hover:border-[var(--custom-200)] group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[var(--custom-100)] rounded-lg group-hover:bg-[var(--custom-200)] transition-colors">
                            <subItem.icon className="w-5 h-5 text-[var(--custom-600)]" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold leading-none text-gray-900 mb-1">
                              {subItem.name}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {subItem.description}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--custom-600)] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );

  return (
    <div className="flex items-center justify-between px-3 sm:px-6 py-3">
      <div className="flex items-center gap-3 sm:gap-6">
        <Logo />
        <div className="hidden lg:block">
          <DesktopMenu />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {session ? (
          <>
            {session.user.role === "ADMIN" && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex hover:bg-[var(--custom-50)] hover:text-[var(--custom-600)] font-medium"
                >
                  Admin
                </Button>
              </Link>
            )}
            <Link href="/user/profile">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex hover:bg-[var(--custom-50)] hover:text-[var(--custom-600)] font-medium"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Profile</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hidden sm:flex font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </>
        ) : (
          <Link href="/auth/signin">
            <Button
              size="sm"
              className="bg-[var(--custom-600)] text-white hover:bg-[var(--custom-700)] shadow-md hover:shadow-lg transition-all font-medium"
            >
              <User className="w-4 h-4 mr-2" />
              <span>Sign In</span>
            </Button>
          </Link>
        )}
        <div className="lg:hidden">
          <MobileMenu />
        </div>
      </div>
    </div>
  );
}