import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-gray-100 py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Quick Links Section */}
                    <div className="text-center sm:text-left">
                        <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="hover:text-indigo-600 transition-colors">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-indigo-600 transition-colors">
                                    Trading Resources
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-indigo-600 transition-colors">
                                    Market Insights
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-indigo-600 transition-colors">
                                    Subscription
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div className="text-center sm:text-left">
                        <h3 className="font-bold mb-4 text-lg">Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="hover:text-indigo-600 transition-colors">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-indigo-600 transition-colors">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-indigo-600 transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-indigo-600 transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links Section */}
                    <div className="text-center sm:text-left">
                        <h3 className="font-bold mb-4 text-lg">Connect With Us</h3>
                        <div className="flex justify-center sm:justify-start space-x-4">
                            <a href="#" className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                                <Facebook className="w-6 h-6" />
                            </a>
                            <a href="#" className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                                <Twitter className="w-6 h-6" />
                            </a>
                            <a href="#" className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a href="#" className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                                <Linkedin className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    {/* Newsletter Section */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <h3 className="font-bold mb-4 text-lg text-center sm:text-left">Newsletter</h3>
                        <p className="mb-4 text-gray-600 text-sm text-center sm:text-left">
                            Stay updated with our latest insights and strategies.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto sm:mx-0">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                type="submit"
                                className="px-3.5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap inline-flex items-center gap-2 group"
                            >

                                <Send className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
                    <p>&copy; {new Date().getFullYear()} Trading Platform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}