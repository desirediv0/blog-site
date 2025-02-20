"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, BookOpen, LineChart, TrendingUp, Users, User, Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const menuItems = [
    {
        title: "Trading Resources",
        icon: BookOpen,
        items: [
            { name: "Guides & Ebooks", href: "/resources/guides" },
            { name: "Cheat Sheets & Downloads", href: "/resources/cheatsheets" },
            { name: "Mini Courses & Blueprints", href: "/resources/courses" },
        ],
    },
    {
        title: "Indicators & Scripts",
        icon: LineChart,
        items: [
            { name: "Pine Script Library", href: "/indicators/pine-scripts" },
            { name: "Custom Indicators", href: "/indicators/custom" },
            { name: "Strategy Breakdown", href: "/indicators/strategies" },
        ],
    },
    {
        title: "Market Insights",
        icon: TrendingUp,
        items: [
            { name: "Daily Analysis", href: "/insights/daily" },
            { name: "Technical Commentary", href: "/insights/technical" },
            { name: "Market Trends", href: "/insights/trends" },
        ],
    },
    {
        title: "Subscription",
        icon: Users,
        items: [
            { name: "Free vs Premium", href: "/subscription/compare" },
            { name: "Manage Subscription", href: "/subscription/manage" },
            { name: "Exclusive Resources", href: "/subscription/exclusive" },
        ],
    },
]


const Logo = () => (
    <Link href="/" className="flex items-center">
        {/* Desktop Logo */}
        <div className="hidden lg:block">
            <Image
                src="/bg.png"
                alt="Desktop Logo"
                width={150}
                height={50}
                priority
                className="object-contain"
            />
        </div>
        {/* Mobile Logo */}
        <div className="lg:hidden">
            <Image
                src="/bg-mob.png"
                alt="Mobile Logo"
                width={60}
                height={60}
                priority
                className="object-contain"
            />
        </div>
    </Link>
)
export function NavMenu() {
    const [isOpen, setIsOpen] = useState(false)

    const MobileMenu = () => (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="lg:hidden">
                    <Menu className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white">
                <nav className="flex flex-col gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-bold text-[var(--custom-500)] hover:text-[var(--custom-600)] transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        HOME
                    </Link>
                    {menuItems.map((item) => (
                        <div key={item.title} className="space-y-2">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                <item.icon className="w-5 h-5" />
                                {item.title}
                            </h2>
                            <ul className="pl-7 space-y-2">
                                {item.items.map((subItem) => (
                                    <li key={subItem.name}>
                                        <a href={subItem.href} className="text-gray-600 hover:text-[var(--custom-600)] transition-colors">
                                            {subItem.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    )

    const DesktopMenu = () => (
        <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>


                {menuItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                        <NavigationMenuTrigger className="flex items-center gap-2 text-gray-600 hover:text-[var(--custom-600)]">
                            <item.icon className="w-5 h-5" />
                            {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 lg:w-[750px] lg:grid-cols-2">
                                {item.items.map((subItem) => (
                                    <li key={subItem.name}>
                                        <NavigationMenuLink href={subItem.href}>{subItem.name}</NavigationMenuLink>
                                    </li>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )

    return (
        <div className="flex items-center justify-between px-4 ">
            <div className="flex items-center">
                <Logo />
                <div className="hidden lg:block">
                    <DesktopMenu />
                </div>
            </div>
            <div className="flex items-center">
                <div className="mx-2">
                    <Link href="/auth">
                        <Button variant="outline" className="text-[var(--custom-600)] hover:bg-[var(--custom-100)]">
                            <User className="w-5 h-5 mr-1" />
                            Sign In
                        </Button>
                    </Link>
                </div>
                <div className="lg:hidden">
                    <MobileMenu />
                </div>
            </div>
        </div>
    )
}

