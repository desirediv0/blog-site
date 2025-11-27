"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

export const dynamic = 'force-dynamic';

interface Resource {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  coverImage?: string | null;
  accessType: string;
  price?: number | null;
  isPublished: boolean;
  published?: boolean;
  featured?: boolean;
  createdAt: string;
  category: {
    name: string;
  };
}

export default function ResourcesManagementPage() {
  const { status } = useSession();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    filterResourceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, resources]);

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/admin/resources");
      const data = await response.json();

      if (response.ok) {
        // API returns { resources: [...] }
        const resourcesList = data.resources || data || [];
        // Map published to isPublished for compatibility
        const mappedResources = resourcesList.map((r: Record<string, unknown>) => ({
          ...r,
          isPublished: r.published !== undefined ? r.published : r.isPublished,
        }));
        setResources(mappedResources);
        setFilteredResources(mappedResources);
      } else {
        console.error("Failed to fetch resources:", data.error);
        toast.error(data.error || "Failed to fetch resources");
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      toast.error("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const filterResourceList = () => {
    if (!Array.isArray(resources)) {
      setFilteredResources([]);
      return;
    }

    if (filterStatus === "all") {
      setFilteredResources(resources);
    } else if (filterStatus === "published") {
      setFilteredResources(resources.filter((r) => r.isPublished));
    } else if (filterStatus === "draft") {
      setFilteredResources(resources.filter((r) => !r.isPublished));
    } else {
      setFilteredResources(
        resources.filter((r) => r.accessType === filterStatus)
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      toast.loading("Deleting resource...");

      const response = await fetch(`/api/admin/resources/${id}`, {
        method: "DELETE",
      });

      toast.dismiss();

      if (response.ok) {
        toast.success("Resource deleted successfully!");
        fetchResources();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete resource");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Failed to delete resource:", error);
      toast.error("Failed to delete resource");
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      toast.loading("Updating featured status...");
      const response = await fetch("/api/featured", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "RESOURCE",
          id,
          featured: !currentFeatured,
        }),
      });

      toast.dismiss();

      if (response.ok) {
        toast.success(
          currentFeatured ? "Removed from featured" : "Marked as featured"
        );
        fetchResources();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update featured status");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Failed to toggle featured:", error);
      toast.error("Failed to update featured status");
    }
  };

  if (status === "loading" || loading) {
    return <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Resources Management</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage all your resources and code snippets
          </p>
        </div>
        <Link href="/admin/resources/create">
          <Button className="w-full sm:w-auto text-sm sm:text-base">Create New Resource</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            size="sm"
          >
            All ({Array.isArray(resources) ? resources.length : 0})
          </Button>
          <Button
            variant={filterStatus === "published" ? "default" : "outline"}
            onClick={() => setFilterStatus("published")}
            size="sm"
          >
            Published (
            {Array.isArray(resources)
              ? resources.filter((r) => r.isPublished).length
              : 0}
            )
          </Button>
          <Button
            variant={filterStatus === "draft" ? "default" : "outline"}
            onClick={() => setFilterStatus("draft")}
            size="sm"
          >
            Drafts (
            {Array.isArray(resources)
              ? resources.filter((r) => !r.isPublished).length
              : 0}
            )
          </Button>
          <Button
            variant={filterStatus === "FREE" ? "default" : "outline"}
            onClick={() => setFilterStatus("FREE")}
            size="sm"
          >
            Free (
            {Array.isArray(resources)
              ? resources.filter((r) => r.accessType === "FREE").length
              : 0}
            )
          </Button>
          <Button
            variant={filterStatus === "PAID" ? "default" : "outline"}
            onClick={() => setFilterStatus("PAID")}
            size="sm"
          >
            Paid (
            {Array.isArray(resources)
              ? resources.filter((r) => r.accessType === "PAID").length
              : 0}
            )
          </Button>
          <Button
            variant={filterStatus === "SUBSCRIPTION" ? "default" : "outline"}
            onClick={() => setFilterStatus("SUBSCRIPTION")}
            size="sm"
          >
            Subscription (
            {Array.isArray(resources)
              ? resources.filter((r) => r.accessType === "SUBSCRIPTION").length
              : 0}
            )
          </Button>
        </div>
      </Card>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No resources found</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {resource.coverImage && (
                  <div className="w-full sm:w-48 h-32 flex-shrink-0">
                    <Image
                      src={resource.coverImage}
                      alt={resource.title}
                      className="w-full h-full object-cover rounded"
                      width={192}
                      height={128}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold mb-1">
                        {resource.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {resource.category.name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${resource.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {resource.isPublished ? "Published" : "Draft"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${resource.accessType === "FREE"
                            ? "bg-blue-100 text-blue-700"
                            : resource.accessType === "PAID"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                            }`}
                        >
                          {resource.accessType}
                          {resource.accessType === "PAID" &&
                            ` - ₹${resource.price}`}
                        </span>
                        {resource.featured && (
                          <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 font-semibold">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {resource.excerpt ||
                      resource.description ||
                      "No description"}
                  </p>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <span>
                      Created:{" "}
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={resource.featured ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        handleToggleFeatured(
                          resource.id,
                          resource.featured || false
                        )
                      }
                      className={
                        resource.featured
                          ? "bg-purple-600 hover:bg-purple-700"
                          : ""
                      }
                    >
                      {resource.featured ? "⭐ Featured" : "Mark Featured"}
                    </Button>
                    <Link href={`/admin/resources/edit/${resource.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/resources/${resource.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(resource.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
