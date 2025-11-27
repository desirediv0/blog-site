"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Share2,
  Bookmark,
  BookmarkCheck,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Clock,
  Eye,
  MessageSquare,
  ChevronUp,
  Edit2,
  Trash2,
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

interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  accessType: string;
  price: number;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
  readingTime?: number;
  views?: number;
  category: {
    name: string;
  };
  author: {
    id: string;
    name: string;
    image?: string;
    bio?: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string;
  };
}

interface RelatedPost {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  category: {
    name: string;
  };
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const contentRef = useRef<HTMLDivElement>(null);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [requiresPurchase, setRequiresPurchase] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchBlog = useCallback(async () => {
    try {
      const response = await fetch(`/api/blogs/${params.slug}`);
      const data = await response.json();

      if (response.ok) {
        setBlog(data.blog);
        setRequiresPurchase(data.requiresPurchase || false);

        // Fetch related posts
        if (data.blog?.category?.name) {
          fetchRelatedPosts(data.blog.category.name, data.blog.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch blog:", error);
      toast.error("Failed to load blog");
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  const fetchRelatedPosts = async (category: string, currentBlogId: string) => {
    try {
      const response = await fetch(
        `/api/blogs/related?category=${category}&excludeId=${currentBlogId}&limit=3`
      );
      if (response.ok) {
        const data = await response.json();
        setRelatedPosts(data.blogs || []);
      }
    } catch (error) {
      console.error("Failed to fetch related posts:", error);
    }
  };

  const fetchComments = useCallback(async () => {
    if (!blog?.id) return;
    try {
      const response = await fetch(`/api/comments?blogId=${blog.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  }, [blog?.id]);

  const checkBookmarkStatus = useCallback(async () => {
    if (!session || !blog?.id) return;
    try {
      const response = await fetch(`/api/bookmarks/check?blogId=${blog.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error("Failed to check bookmark:", error);
    }
  }, [session, blog?.id]);

  useEffect(() => {
    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug, fetchBlog]);

  useEffect(() => {
    if (blog?.id) {
      fetchComments();
      checkBookmarkStatus();
    }
  }, [blog?.id, fetchComments, checkBookmarkStatus]);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const windowHeight = window.innerHeight;
      const documentHeight = contentRef.current.scrollHeight;
      const scrollTop = window.scrollY;

      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));

      setShowScrollTop(scrollTop > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!commentContent.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId: blog?.id,
          content: commentContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to add comment");
        return;
      }

      toast.success("Comment added successfully");
      setCommentContent("");
      fetchComments();
    } catch (error) {
      toast.error("Failed to add comment");
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        toast.success("Comment updated");
        setEditingCommentId(null);
        setEditContent("");
        fetchComments();
      } else {
        toast.error("Failed to update comment");
      }
    } catch (error) {
      toast.error("Failed to update comment");
      console.log("Failed to update comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Comment deleted");
        fetchComments();
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      toast.error("Failed to delete comment");
      console.log("Failed to delete comment:", error);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch("/api/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blogId: blog?.id }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Bookmark removed" : "Bookmarked!");
      }
    } catch (error) {
      toast.error("Failed to bookmark");
      console.log("Failed to bookmark:", error);
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || "";

    const shareUrls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
    };

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        setShowShareMenu(false);
      } catch (error) {
        toast.error("Failed to copy link");
        console.log("Failed to copy link:", error);
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
      setShowShareMenu(false);
    }
  };

  const handlePurchase = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch("/api/payments/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "BLOG",
          itemId: blog?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options: RazorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: "Blog Purchase",
          description: blog?.title,
          handler: async (response: RazorpayResponse) => {
            const verifyResponse = await fetch("/api/payments/order", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId: data.paymentId,
              }),
            });

            if (verifyResponse.ok) {
              toast.success("Payment successful!");
              fetchBlog();
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Failed to process payment");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Skeleton Loader */}
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Blog not found</h2>
        <Link href="/blogs">
          <Button>Back to Blogs</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-[var(--custom-600)] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-[var(--custom-600)] text-white rounded-full shadow-lg hover:bg-[var(--custom-700)] transition-all z-40"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      <div className="mx-auto px-4 py-12 max-w-4xl" ref={contentRef}>
        {/* Cover Image */}
        {blog.coverImage && (
          <div className="aspect-video bg-gray-200 relative mb-8 rounded-xl overflow-hidden shadow-2xl">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Header */}
        <article className="mb-8">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
            <span className="text-[var(--custom-600)] font-semibold bg-[var(--custom-50)] px-3 py-1 rounded-full">
              {blog.category.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {blog.readingTime || 5} min read
            </span>
            {blog.views && (
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {blog.views} views
              </span>
            )}
            <span>
              {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {blog.accessType === "PAID" && blog.price && (
              <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                ₹{blog.price}
              </span>
            )}
            {blog.accessType === "SUBSCRIPTION" && (
              <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-semibold">
                Premium
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--custom-500)] flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                {blog.author.image ? (
                  <Image
                    src={blog.author.image}
                    alt={blog.author.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  blog.author.name[0]?.toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{blog.author.name}</h3>
                {blog.author.bio && (
                  <p className="text-sm text-gray-600">{blog.author.bio}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleBookmark}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-[var(--custom-600)]" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
                    <button
                      onClick={() => handleShare("twitter")}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <Twitter className="w-5 h-5 text-blue-400" />
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <Facebook className="w-5 h-5 text-blue-600" />
                      Share on Facebook
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      Share on LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t"
                    >
                      <Link2 className="w-5 h-5" />
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {blog.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blogs?tag=${tag.name}`}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* Content */}
        {requiresPurchase ? (
          <div className="relative min-h-[600px]">
            <div
              className="prose prose-lg max-w-none blog-content mb-8 blur-md select-none pointer-events-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-white/90 to-white">
              <Card className="p-8 text-center max-w-md shadow-2xl border-2">
                <div className="w-16 h-16 bg-[var(--custom-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-8 h-8 text-[var(--custom-600)]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {blog.accessType === "PAID"
                    ? "Premium Content"
                    : "Subscription Required"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {blog.accessType === "PAID"
                    ? `Unlock this article for just ₹${blog.price} and get lifetime access`
                    : "Subscribe to access all premium content and exclusive articles"}
                </p>
                {blog.accessType === "PAID" ? (
                  <Button
                    onClick={handlePurchase}
                    size="lg"
                    className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white w-full"
                  >
                    Purchase for ₹{blog.price}
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push("/subscription")}
                    size="lg"
                    className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white w-full"
                  >
                    Subscribe Now
                  </Button>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div
              className="prose prose-lg max-w-none blog-content mb-12"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="my-12 py-8 border-t">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video relative bg-gray-200">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <span className="text-xs text-[var(--custom-600)] font-semibold">
                            {post.category.name}
                          </span>
                          <h3 className="font-semibold mt-2 line-clamp-2 group-hover:text-[var(--custom-600)] transition-colors">
                            {post.title}
                          </h3>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-6 h-6 text-[var(--custom-600)]" />
                <h2 className="text-2xl font-bold">
                  Comments ({comments.length})
                </h2>
              </div>

              {session ? (
                <Card className="p-6 mb-8 shadow-sm">
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <div>
                      <label
                        htmlFor="comment"
                        className="block text-sm font-medium mb-2"
                      >
                        Share your thoughts
                      </label>
                      <textarea
                        id="comment"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write your comment here..."
                        className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--custom-500)] focus:border-transparent resize-none"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingComment}
                      className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
                    >
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </Button>
                  </form>
                </Card>
              ) : (
                <Card className="p-6 mb-8 text-center bg-gray-50">
                  <p className="text-gray-600 mb-4">
                    Sign in to join the conversation
                  </p>
                  <Link href="/auth/signin">
                    <Button className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)]">
                      Sign In
                    </Button>
                  </Link>
                </Card>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <Card className="p-8 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </Card>
                ) : (
                  comments.map((comment) => (
                    <Card
                      key={comment.id}
                      className="p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--custom-500)] flex items-center justify-center text-white font-semibold overflow-hidden">
                          {comment.user.image ? (
                            <Image
                              src={comment.user.image}
                              alt={comment.user.name || ""}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            (
                              comment.user.name?.[0] || comment.user.email[0]
                            )?.toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {comment.user.name ||
                                  comment.user.email.split("@")[0]}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>

                            {session?.user?.email === comment.user.email && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditContent(comment.content);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="p-1 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            )}
                          </div>

                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full min-h-[80px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--custom-500)]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditComment(comment.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditContent("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {comment.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .blog-content {
          color: #374151;
        }

        .blog-content h1 {
          color: var(--custom-600);
          font-size: 2rem;
          font-weight: bold;
          margin: 2rem 0 1rem 0;
          line-height: 1.3;
        }

        .blog-content h2 {
          color: var(--custom-600);
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1.5rem 0 0.75rem 0;
          line-height: 1.4;
        }

        .blog-content h3 {
          color: var(--custom-600);
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1.25rem 0 0.5rem 0;
        }

        .blog-content p {
          color: #374151;
          margin: 1rem 0;
          line-height: 1.8;
          font-size: 1.0625rem;
        }

        .blog-content strong {
          font-weight: 600;
          color: #111827;
        }

        .blog-content em {
          font-style: italic;
        }

        .blog-content code {
          background-color: #f3f4f6;
          color: var(--custom-600);
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          font-family: "Courier New", monospace;
          font-size: 0.9em;
        }

        .blog-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1.25rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .blog-content pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }

        .blog-content blockquote {
          border-left: 4px solid var(--custom-500);
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          color: #6b7280;
          font-style: italic;
          background-color: var(--custom-50);
          padding: 1rem 1.25rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .blog-content ul,
        .blog-content ol {
          padding-left: 1.75rem;
          margin: 1.25rem 0;
        }

        .blog-content ul {
          list-style-type: disc;
        }

        .blog-content ol {
          list-style-type: decimal;
        }

        .blog-content li {
          color: #374151;
          margin: 0.5rem 0;
          line-height: 1.75;
        }

        .blog-content a {
          color: var(--custom-600);
          text-decoration: underline;
          transition: color 0.2s;
        }

        .blog-content a:hover {
          color: var(--custom-700);
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .blog-content th,
        .blog-content td {
          border: 1px solid #e5e7eb;
          padding: 0.875rem 1rem;
          text-align: left;
        }

        .blog-content th {
          background-color: var(--custom-50);
          color: var(--custom-700);
          font-weight: 600;
        }

        .blog-content tr:nth-child(even) td {
          background-color: #f9fafb;
        }

        .blog-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2.5rem 0;
        }
      `}</style>
    </>
  );
}
