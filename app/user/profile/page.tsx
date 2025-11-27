"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  blogPurchases: Array<{
    blog: {
      id: string;
      title: string;
      slug: string;
      price: number;
    };
    createdAt: string;
  }>;
  resourcePurchases: Array<{
    resource: {
      id: string;
      title: string;
      slug: string;
      price: number;
    };
    createdAt: string;
  }>;
  subscriptions: Array<{
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    cancelledAt: string | null;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    razorpayOrderId: string | null;
    subscription: {
      id: string;
      status: string;
    } | null;
  }>;
}

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && !hasFetched.current) {
      hasFetched.current = true;
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Subscription cancelled successfully");
        fetchProfile();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-600">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-600">{profile.email}</p>
        </div>
        <Link href="/user/profile/change-password">
          <Button variant="outline">Change Password</Button>
        </Link>
      </div>

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Blog Purchases</h2>
            {profile.blogPurchases.length === 0 ? (
              <Card className="p-8 text-center border-2 border-dashed">
                <p className="text-gray-500 text-lg">No blog purchases yet</p>
                <Link href="/blogs" className="mt-4 inline-block">
                  <Button variant="outline">Browse Blogs</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.blogPurchases.map((purchase) => (
                  <Card
                    key={purchase.blog.id}
                    className="p-6 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold mb-3 text-gray-900 line-clamp-2">
                          {purchase.blog.title}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="font-medium">Purchased:</span>
                            <span>
                              {new Date(purchase.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="font-medium">Price:</span>
                            <span className="text-green-600 font-semibold">
                              ₹{purchase.blog.price}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/blogs/${purchase.blog.slug}`}
                        className="mt-auto"
                      >
                        <Button className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white">
                          Read Now
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Resource Purchases</h2>
            {profile.resourcePurchases.length === 0 ? (
              <Card className="p-8 text-center border-2 border-dashed">
                <p className="text-gray-500 text-lg">
                  No resource purchases yet
                </p>
                <Link href="/resources" className="mt-4 inline-block">
                  <Button variant="outline">Browse Resources</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.resourcePurchases.map((purchase) => (
                  <Card
                    key={purchase.resource.id}
                    className="p-6 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold mb-3 text-gray-900 line-clamp-2">
                          {purchase.resource.title}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="font-medium">Purchased:</span>
                            <span>
                              {new Date(purchase.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="font-medium">Price:</span>
                            <span className="text-green-600 font-semibold">
                              ₹{purchase.resource.price}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/resources/${purchase.resource.slug}`}
                        className="mt-auto"
                      >
                        <Button className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white">
                          View Resource
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">My Subscriptions</h2>
            {profile.subscriptions.length === 0 ? (
              <Card className="p-8 text-center border-2 border-dashed">
                <p className="text-gray-500 text-lg mb-4">
                  No active subscriptions
                </p>
                <Link href="/subscription/compare">
                  <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white">
                    Subscribe Now
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.subscriptions.map((subscription) => (
                  <Card
                    key={subscription.id}
                    className="p-6 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          Premium Subscription
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${subscription.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : subscription.status === "CANCELLED"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {subscription.status}
                        </span>
                      </div>
                      <div className="space-y-3 mb-4 flex-grow">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Start Date:
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(
                              subscription.startDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            End Date:
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(subscription.endDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        {subscription.cancelledAt && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-yellow-700">
                              Cancelled:
                            </span>
                            <span className="text-sm text-yellow-600">
                              {new Date(
                                subscription.cancelledAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      {subscription.status === "ACTIVE" &&
                        !subscription.cancelledAt && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleCancelSubscription(subscription.id)
                            }
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            Cancel Subscription
                          </Button>
                        )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Payment History</h2>
            {profile.payments.length === 0 ? (
              <Card className="p-8 text-center border-2 border-dashed">
                <p className="text-gray-500 text-lg">No payment history</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.payments.map((payment) => (
                  <Card
                    key={payment.id}
                    className="p-6 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            ₹{payment.amount.toFixed(2)} {payment.currency}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full ${payment.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      {payment.razorpayOrderId && (
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">
                            Order ID:
                          </p>
                          <p className="text-xs text-gray-700 font-mono break-all">
                            {payment.razorpayOrderId}
                          </p>
                        </div>
                      )}
                      {payment.subscription && (
                        <div className="pt-2">
                          <span className="text-xs text-gray-500">
                            Subscription Payment
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
