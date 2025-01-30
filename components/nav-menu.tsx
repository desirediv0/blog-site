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

export function NavMenu() {
    const [isOpen, setIsOpen] = useState(false)

    const MobileMenu = () => (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="lg:hidden">
                    <Menu className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                    <a
                        href="/"
                        className="flex items-center gap-2 text-lg font-bold text-indigo-700 hover:text-indigo-600 transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        HOME
                    </a>
                    {menuItems.map((item) => (
                        <div key={item.title} className="space-y-2">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                <item.icon className="w-5 h-5" />
                                {item.title}
                            </h2>
                            <ul className="pl-7 space-y-2">
                                {item.items.map((subItem) => (
                                    <li key={subItem.name}>
                                        <a href={subItem.href} className="text-gray-600 hover:text-indigo-600 transition-colors">
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
                <NavigationMenuItem>
                    <NavigationMenuLink
                        className="flex items-center gap-2 text-lg font-bold text-indigo-700 hover:text-indigo-600 transition-colors"
                        href="/"
                    >
                        <Home className="w-5 h-5" />
                        HOME
                    </NavigationMenuLink>
                </NavigationMenuItem>

                {menuItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                        <NavigationMenuTrigger className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
                            <item.icon className="w-5 h-5" />
                            {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 lg:w-[500px] lg:grid-cols-2">
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
        <div className="flex items-center justify-between">
            <MobileMenu />
            <DesktopMenu />

            <div className="flex items-center gap-4">
                <Button variant="ghost" className="hidden lg:flex text-indigo-600 hover:bg-indigo-100">
                    <User className="w-5 h-5 mr-2" />
                    LOGIN
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                    <span className="hidden lg:inline">GET FREE ACCOUNT</span>
                    <span className="lg:hidden">SIGN UP</span>
                </Button>
            </div>
        </div>
    )
}

