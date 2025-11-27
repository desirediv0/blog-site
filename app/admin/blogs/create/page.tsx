"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import { TagSelector } from "@/components/tag-selector";
import toast from "react-hot-toast";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

export default function CreateBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    accessType: "FREE" as "FREE" | "PAID" | "SUBSCRIPTION",
    price: "",
    categoryId: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    tags: [] as string[],
    published: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const loadingToast = toast.loading("Uploading cover image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFormData((prev) => ({ ...prev, coverImage: data.url }));
      setUploadedImageUrl(data.url); // Store for cleanup if needed
      toast.success("Image uploaded successfully!", { id: loadingToast });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message, { id: loadingToast });
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteUploadedImage = async (imageUrl: string) => {
    try {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: imageUrl }),
      });
    } catch (error) {
      console.error("Failed to delete uploaded image:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.accessType === "PAID" && !formData.price) {
      toast.error("Please enter a price for paid content");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading(
      publish ? "Publishing blog..." : "Saving draft..."
    );

    try {
      const keywords = formData.keywords
        ? formData.keywords.split(",").map((k) => k.trim())
        : [];

      const tags = formData.tags || [];

      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price:
            formData.accessType === "PAID"
              ? parseFloat(formData.price)
              : undefined,
          keywords,
          tags,
          published: publish,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If blog creation failed and we uploaded an image, delete it
        if (uploadedImageUrl && formData.coverImage === uploadedImageUrl) {
          await deleteUploadedImage(uploadedImageUrl);
          setFormData((prev) => ({ ...prev, coverImage: "" }));
          setUploadedImageUrl(null);
        }
        throw new Error(data.error || "Failed to create blog");
      }

      // Success - clear uploaded image URL
      setUploadedImageUrl(null);

      toast.success(
        publish ? "Blog published successfully!" : "Draft saved successfully!",
        {
          id: loadingToast,
        }
      );
      router.push("/admin/blogs");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create blog";
      toast.error(message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Blog</h1>
        <p className="text-gray-600">Write and publish your blog post</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter blog title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="blog-url-slug"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Excerpt <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Short description of the blog"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--custom-500)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cover Image
              </label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {formData.coverImage && (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <Image
                      src={formData.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      fill
                      unoptimized={formData.coverImage.startsWith("http")}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--custom-500)]"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Access Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.accessType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accessType: e.target.value as
                        | "FREE"
                        | "PAID"
                        | "SUBSCRIPTION",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--custom-500)]"
                >
                  <option value="FREE">Free</option>
                  <option value="PAID">Paid (One-time)</option>
                  <option value="SUBSCRIPTION">Subscription Only</option>
                </select>
              </div>
            </div>

            {formData.accessType === "PAID" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="99"
                  required
                />
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Content <span className="text-red-500">*</span>
          </h2>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
            placeholder="Write your blog content here..."
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Meta Title
              </label>
              <Input
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                placeholder="SEO title (leave empty to use blog title)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                placeholder="SEO description"
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--custom-500)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Keywords{" "}
                <span className="text-gray-500">(comma separated)</span>
              </label>
              <Input
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                placeholder="trading, stocks, market"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tags
              </label>
              <TagSelector
                selectedTags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                allowCreate={true}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/blogs")}
            disabled={loading}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button type="submit" variant="outline" disabled={loading}>
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
            >
              Publish Blog
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
