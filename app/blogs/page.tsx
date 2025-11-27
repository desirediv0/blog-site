"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedBlogCard } from "./EnhancedBlogCard";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  accessType: "FREE" | "PAID" | "SUBSCRIPTION";
  price: number;
  publishedAt: string;
  category: {
    name: string;
    slug: string;
  };
  author: {
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function BlogsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const accessType = searchParams.get("accessType") || "";
  const categorySlug = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessType, categorySlug, page, search]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (accessType) params.set("accessType", accessType);
      if (categorySlug) params.set("category", categorySlug);
      if (page > 1) params.set("page", page.toString());
      if (search) params.set("search", search);

      const response = await fetch(`/api/blogs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
        setCurrentPage(data.pagination?.page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--custom-600)] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Blog Posts </h1>
        <p className="text-gray-600">
          Discover insights, strategies, and market analysis
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-8">
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search blogs by title, content, or excerpt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  handleFilterChange("search", "");
                }}
              >
                Clear
              </Button>
            )}
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select
                value={categorySlug || "all"}
                onValueChange={(value) =>
                  handleFilterChange("category", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Access Type
              </label>
              <Select
                value={accessType || "all"}
                onValueChange={(value) =>
                  handleFilterChange("accessType", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--custom-600)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blogs...</p>
        </div>
      ) : (
        <>
          {total > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {blogs.length} of {total} blogs
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <EnhancedBlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {!loading && blogs.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-600">
            {search ? `No blogs found for "${search}"` : "No blogs available"}
          </p>
          {search && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                handleFilterChange("search", "");
              }}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          Loading...
        </div>
      }
    >
      <BlogsContent />
    </Suspense>
  );
}
