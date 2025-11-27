"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home } from "lucide-react";
import Link from "next/link";

export function AdminHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--custom-600)]">
              Admin Panel
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" target="_blank">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">View Site</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
            <User className="h-4 w-4 text-gray-600" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
