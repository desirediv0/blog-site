import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-100 py-4 sm:py-8 lg:py-12 hidden lg:block">
      <div className=" mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick Links Section */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="hover:text-[var(--custom-600)] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="hover:text-[var(--custom-600)] transition-colors"
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/guides"
                  className="hover:text-[var(--custom-600)] transition-colors"
                >
                  Trading Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/insights/technical"
                  className="hover:text-[var(--custom-600)] transition-colors"
                >
                  Market Insights
                </Link>
              </li>
              <li>
                <Link
                  href="/subscription/compare"
                  className="hover:text-[var(--custom-600)] transition-colors"
                >
                  Subscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold mb-4 text-lg">Support</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--custom-600)] transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--custom-600)] transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--custom-600)] transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--custom-600)] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links Section */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold mb-4 text-lg">Connect With Us</h3>
            <div className="flex justify-center sm:justify-start space-x-4">
              <a
                href="#"
                className="p-2 text-gray-600 hover:text-[var(--custom-600)] transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="p-2 text-gray-600 hover:text-[var(--custom-600)] transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="p-2 text-gray-600 hover:text-[var(--custom-600)] transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="p-2 text-gray-600 hover:text-[var(--custom-600)] transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>


        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Stockey. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
