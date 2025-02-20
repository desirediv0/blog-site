import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import type React from "react"
import { NavMenu } from "@/components/nav-menu"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stockey - Discover trading strategies, indicators, and market insights",
  description: "Discover trading strategies, indicators, and market insights",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-white/50 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-4">
              <NavMenu />
            </div>
          </header>
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}

