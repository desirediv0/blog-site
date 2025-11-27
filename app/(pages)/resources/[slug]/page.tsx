"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  CreditCard,
  Crown,
  User,
  Tag,
  Loader2,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string | undefined;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

interface CodeBlock {
  id?: string;
  title?: string;
  language?: string;
  code?: string;
}

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  coverImage: string | null;
  codeBlocks: CodeBlock[] | null;
  accessType: string;
  price: number | null;
  hasAccess: boolean;
  category: {
    name: string;
    slug: string;
  };
  author: {
    name: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function ResourceDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchResource = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/resources/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Resource not found");
        }
        throw new Error("Failed to load resource");
      }

      const data = await response.json();
      setResource(data.resource);
    } catch (error) {
      console.error("Failed to fetch resource:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load resource";
      setError(errorMessage);
      toast.error(errorMessage);

      // Redirect after a delay if resource not found
      setTimeout(() => router.push("/resources"), 2000);
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    if (slug) {
      fetchResource();
    }
  }, [slug, fetchResource]);

  const loadRazorpayScript = useCallback(async () => {
    if (window.Razorpay) return true;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });
  }, []);

  const handlePurchase = useCallback(async () => {
    if (status === "loading") {
      toast.error("Please wait...");
      return;
    }

    if (status === "unauthenticated" || !session) {
      toast.error("Please sign in to purchase");
      router.push(`/auth/signin?callbackUrl=/resources/${slug}`);
      return;
    }

    if (!resource || !resource.price) {
      toast.error("Invalid resource");
      return;
    }

    setPurchasing(true);

    try {
      // Create order
      const orderResponse = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "RESOURCE",
          itemId: resource.id,
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to create order");
      }

      const { orderId, paymentId, amount, currency } =
        await orderResponse.json();

      // Load Razorpay script
      await loadRazorpayScript();

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount || resource.price * 100,
        currency: currency || "INR",
        order_id: orderId,
        name: "Blog Platform",
        description: `Purchase: ${resource.title}`,
        prefill: {
          name: session.user?.name || "",
          email: session.user?.email || "",
        },
        theme: {
          color: "#3b82f6",
        },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyResponse = await fetch("/api/payments/order", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId: paymentId,
              }),
            });

            if (!verifyResponse.ok) {
              const error = await verifyResponse.json();
              throw new Error(error.error || "Payment verification failed");
            }

            toast.success("Purchase successful! 🎉");
            await fetchResource();
          } catch (error) {
            console.error("Payment verification error:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Payment verification failed";
            toast.error(errorMessage);
          } finally {
            setPurchasing(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Purchase error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initiate purchase";
      toast.error(errorMessage);
      setPurchasing(false);
    }
  }, [
    status,
    session,
    resource,
    router,
    slug,
    loadRazorpayScript,
    fetchResource,
  ]);

  const copyToClipboard = useCallback(async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      toast.success("Code copied!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
      console.log("Failed to copy code:", error);
    }
  }, []);

  const getAccessTypeBadge = useCallback(() => {
    if (!resource) return null;

    switch (resource.accessType) {
      case "FREE":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Free
          </Badge>
        );
      case "PAID":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <CreditCard className="w-3 h-3 mr-1" />₹{resource.price}
          </Badge>
        );
      case "SUBSCRIPTION":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        );
      default:
        return null;
    }
  }, [resource]);

  // Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--custom-600)] mb-4" />
          <p className="text-gray-600">Loading resource...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !resource) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-red-600 text-lg mb-4">
              {error || "Resource not found"}
            </p>
            <Link href="/resources">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Resources
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/resources"
          className="inline-flex items-center text-[var(--custom-600)] hover:text-[var(--custom-700)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Link>
      </div>

      {/* Cover Image */}
      {resource.coverImage && (
        <div className="aspect-video bg-gray-200 relative mb-8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={resource.coverImage}
            alt={resource.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Resource Header */}
      <div className="mb-8">
        {/* Meta Information */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 flex-wrap">
          <Badge
            variant="outline"
            className="text-[var(--custom-600)] border-[var(--custom-600)]"
          >
            <Tag className="w-3 h-3 mr-1" />
            {resource.category.name}
          </Badge>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {resource.author.name}
          </span>
          {getAccessTypeBadge()}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
          {resource.title}
        </h1>

        {/* Description */}
        {resource.description && (
          <div
            className="text-gray-600 text-lg leading-relaxed prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: resource.description }}
          />
        )}
      </div>

      {/* Content Area */}
      {!resource.hasAccess && resource.accessType !== "FREE" ? (
        /* Locked Content with Preview */
        <div className="relative min-h-[500px]">
          {/* Blurred Preview */}
          <div className="pointer-events-none select-none">
            {resource.content && (
              <div
                className="prose prose-lg max-w-none resource-content mb-8 blur-md"
                dangerouslySetInnerHTML={{ __html: resource.content }}
              />
            )}
            {resource.codeBlocks && resource.codeBlocks.length > 0 && (
              <div className="space-y-4 mb-8 blur-md">
                {resource.codeBlocks.slice(0, 2).map((block, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-6">
                    {block.title && (
                      <h4 className="text-white mb-3 font-semibold">
                        {block.title}
                      </h4>
                    )}
                    <pre className="text-sm text-gray-100 font-mono">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/70 via-white/90 to-white backdrop-blur-sm">
            <Card className="p-8 md:p-10 text-center max-w-lg shadow-2xl border-2">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[var(--custom-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-[var(--custom-600)]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                  Access Required
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  {resource.accessType === "PAID"
                    ? `Unlock this premium resource for just ₹${resource.price} and get lifetime access to all content and code examples.`
                    : "This exclusive resource is available to premium subscribers. Subscribe now to access this and hundreds of other resources."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {resource.accessType === "PAID" ? (
                  <>
                    <Button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white min-w-[180px]"
                      size="lg"
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Purchase ₹{resource.price}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/resources")}
                      size="lg"
                    >
                      Browse Free Resources
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push("/subscription")}
                      className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white min-w-[180px]"
                      size="lg"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/resources")}
                      size="lg"
                    >
                      View Plans
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Unlocked Content */
        <>
          {/* Main Content */}
          {resource.content && (
            <div
              className="prose prose-lg max-w-none resource-content mb-12"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          )}

          {/* Code Blocks */}
          {resource.codeBlocks && resource.codeBlocks.length > 0 && (
            <div className="space-y-6 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Code Examples
              </h2>
              {resource.codeBlocks.map((block, index) => (
                <Card key={index} className="overflow-hidden shadow-lg">
                  <div className="bg-gray-900 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                      {block.title && (
                        <h4 className="text-white font-semibold text-base md:text-lg">
                          {block.title}
                        </h4>
                      )}
                      {block.language && (
                        <Badge variant="secondary" className="text-xs">
                          {block.language}
                        </Badge>
                      )}
                    </div>

                    <div className="relative group">
                      <pre className="text-sm text-gray-100 font-mono overflow-x-auto whitespace-pre-wrap break-words">
                        <code>{block.code}</code>
                      </pre>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(block.code || "", index)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 hover:bg-gray-700 text-white"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Success Message for Purchased Content */}
          {resource.hasAccess && resource.accessType === "PAID" && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">
                    You own this resource
                  </h4>
                  <p className="text-green-700 text-sm">
                    Thank you for your purchase! You have lifetime access to
                    this content.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Resource Styles */}
      <style jsx global>{`
        .resource-content {
          color: #374151;
          line-height: 1.8;
        }

        .resource-content h1 {
          color: var(--custom-600);
          font-size: 2rem;
          font-weight: bold;
          margin: 2rem 0 1rem 0;
          line-height: 1.3;
        }

        .resource-content h2 {
          color: var(--custom-600);
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1.75rem 0 0.875rem 0;
          line-height: 1.4;
        }

        .resource-content h3 {
          color: var(--custom-600);
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
        }

        .resource-content p {
          color: #374151;
          margin: 1rem 0;
          line-height: 1.8;
        }

        .resource-content strong {
          font-weight: 600;
          color: #111827;
        }

        .resource-content em {
          font-style: italic;
        }

        .resource-content code {
          background-color: #f3f4f6;
          color: var(--custom-600);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-family: "Courier New", monospace;
          font-size: 0.875em;
          font-weight: 500;
        }

        .resource-content pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1.25rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .resource-content pre code {
          background-color: transparent;
          color: #f3f4f6;
          padding: 0;
          font-size: 0.875rem;
        }

        .resource-content blockquote {
          border-left: 4px solid var(--custom-500);
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          color: #6b7280;
          font-style: italic;
          background-color: #f9fafb;
          padding: 1rem 1rem 1rem 1.25rem;
          border-radius: 0.375rem;
        }

        .resource-content ul,
        .resource-content ol {
          padding-left: 1.75rem;
          margin: 1.25rem 0;
        }

        .resource-content ul {
          list-style-type: disc;
        }

        .resource-content ol {
          list-style-type: decimal;
        }

        .resource-content li {
          color: #374151;
          margin: 0.5rem 0;
          line-height: 1.75;
        }

        .resource-content a {
          color: var(--custom-600);
          text-decoration: underline;
          transition: color 0.2s;
        }

        .resource-content a:hover {
          color: var(--custom-700);
        }

        .resource-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem auto;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          display: block;
        }

        .resource-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .resource-content th,
        .resource-content td {
          border: 1px solid #e5e7eb;
          padding: 0.875rem 1.25rem;
          text-align: left;
        }

        .resource-content th {
          background-color: var(--custom-50);
          color: var(--custom-700);
          font-weight: 600;
        }

        .resource-content tr:nth-child(even) td {
          background-color: #f9fafb;
        }

        .resource-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }

        @media (max-width: 768px) {
          .resource-content h1 {
            font-size: 1.75rem;
          }

          .resource-content h2 {
            font-size: 1.375rem;
          }

          .resource-content h3 {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
}
