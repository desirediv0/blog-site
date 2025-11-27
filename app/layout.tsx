import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import type React from "react"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "react-hot-toast"
import { ConditionalLayout } from "@/components/conditional-layout"

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
        <AuthProvider>
          <Toaster position="top-right" />
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}

