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
      { name: "Guides & Ebooks", icon: BookOpen, href: "/resources/guides" },
      {
        name: "Cheat Sheets & Downloads",
        icon: BookOpen,
        href: "/resources/cheatsheets",
      },
      {
        name: "Mini Courses & Blueprints",
        icon: BookOpen,
        href: "/resources/courses",
      },
      {
        name: "Top Trading Strategies",
        icon: BookOpen,
        href: "/resources/strategies",
      },
    ],
  },
  {
    title: "Indicators & Scripts",
    icon: LineChart,
    items: [
      {
        name: "Pine Script Library",
        icon: BookOpen,
        href: "/indicators/pine-scripts",
      },
      { name: "Custom Indicators", icon: BookOpen, href: "/indicators/custom" },
      {
        name: "Strategy Breakdown",
        icon: BookOpen,
        href: "/indicators/strategies",
      },
    ],
  },
  {
    title: "Market Insights",
    icon: TrendingUp,
    items: [
      {
        name: "Articles & Quick Reads",
        icon: BookOpen,
        href: "/insights/daily",
      },
      {
        name: "Market Insights & Commentary",
        icon: BookOpen,
        href: "/insights/technical",
      },
      { name: "Charts", icon: BookOpen, href: "/insights/trends" },
      { name: "Screeners", icon: BookOpen, href: "/insights/screeners"},
    ],
  },
  {
    title: "Subscription",
    icon: Users,
    items: [
      {
        name: "Free vs Premium",
        icon: BookOpen,
        href: "/subscription/compare",
      },
      {
        name: "Manage Subscription",
        icon: BookOpen,
        href: "/subscription/manage",
      },
      {
        name: "Exclusive Resources",
        icon: BookOpen,
        href: "/subscription/exclusive",
      },
    ],
  },
];


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
                      <subItem.icon className="w-5 h-5" />
                      <a
                        href={subItem.href}
                        className="text-gray-600 hover:text-[var(--custom-600)] transition-colors"
                      >
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
    );

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
                    <li
                      key={subItem.name}
                      className="flex items-center justify-start  px-3 rounded-lg hover:bg-[var(--custom-50)] hover:text-black transition-all duration-200"
                    >
                      <subItem.icon className="w-5 h-5" />
                      <NavigationMenuLink
                        href={subItem.href}
                        className="block p-3 rounded-lg hover:bg-[var(--custom-50)] hover:text-black transition-all duration-200"
                      >
                        {subItem.name}
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
                        <Button variant="default" className="bg-[var(--custom-600)] text-white hover:bg-[var(--custom-700)] transition-colors">
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

