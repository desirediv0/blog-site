"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

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
  const [oldCoverImage, setOldCoverImage] = useState<string>("");

  useEffect(() => {
    fetchBlog();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBlog = async () => {
    try {
      const blogId = Array.isArray(params.id) ? params.id[0] : params.id;
      const response = await fetch(`/api/admin/blogs/${blogId}`);
      if (response.ok) {
        const data = await response.json();
        const blog = data.blog;
        const coverImageUrl = blog.coverImage || "";
        setFormData({
          title: blog.title || "",
          slug: blog.slug || "",
          content: blog.content || "",
          excerpt: blog.excerpt || "",
          coverImage: coverImageUrl,
          accessType: blog.accessType || "FREE",
          price: blog.price?.toString() || "",
          categoryId: blog.categoryId || blog.category?.id || "",
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          keywords: blog.keywords?.join(", ") || "",
          tags: blog.tags?.map((tag: { name: string }) => tag.name) || [],
          published: blog.published || false,
        });
        setOldCoverImage(coverImageUrl);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to load blog");
      }
    } catch (error) {
      console.error("Failed to fetch blog:", error);
      toast.error("Failed to load blog");
    } finally {
      setFetching(false);
    }
  };

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
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Delete old image if exists
      if (oldCoverImage && oldCoverImage !== data.url) {
        try {
          await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: oldCoverImage }),
          });
        } catch (deleteError) {
          console.error("Failed to delete old image:", deleteError);
          // Don't fail the upload if delete fails
        }
      }

      setFormData((prev) => ({ ...prev, coverImage: data.url }));
      setOldCoverImage(data.url);
      toast.success("Image uploaded successfully!", { id: loadingToast });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message, { id: loadingToast });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.coverImage) return;

    if (confirm("Are you sure you want to remove this image?")) {
      try {
        // Delete from storage
        if (formData.coverImage) {
          await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: formData.coverImage }),
          });
        }
        setFormData((prev) => ({ ...prev, coverImage: "" }));
        setOldCoverImage("");
        toast.success("Image removed");
      } catch (error) {
        console.error("Failed to delete image:", error);
        // Still remove from form even if delete fails
        setFormData((prev) => ({ ...prev, coverImage: "" }));
        setOldCoverImage("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
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
    const loadingToast = toast.loading("Updating blog...");

    try {
      const keywords = formData.keywords
        ? formData.keywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k.length > 0)
        : [];

      const tags = formData.tags || [];

      // Delete old image if it was changed
      if (
        oldCoverImage &&
        formData.coverImage !== oldCoverImage &&
        oldCoverImage
      ) {
        try {
          await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: oldCoverImage }),
          });
        } catch (deleteError) {
          console.error("Failed to delete old image:", deleteError);
          // Continue with update even if delete fails
        }
      }

      const blogId = Array.isArray(params.id) ? params.id[0] : params.id;
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price:
            formData.accessType === "PAID" && formData.price
              ? parseFloat(formData.price)
              : undefined,
          keywords,
          tags,
          published: publish !== undefined ? publish : formData.published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update blog");
      }

      toast.success("Blog updated successfully!", { id: loadingToast });
      router.push("/admin/blogs");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update blog";
      toast.error(message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading blog...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Blog</h1>
        <p className="text-gray-600">Update your blog post</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

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
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated from title, but you can edit it
              </p>
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
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden group">
                    <Image
                      src={formData.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      width={1280}
                      height={720}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
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
            key={
              Array.isArray(params.id) ? params.id[0] : params.id || "default"
            } // Force re-render when blog changes
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
              <label className="block text-sm font-medium mb-1">Tags</label>
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
            {formData.published ? (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
              >
                Unpublish
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Publish
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
            >
              Update Blog
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
