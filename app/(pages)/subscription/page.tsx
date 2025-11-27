"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number; // Duration in months
  features: string[];
  active: boolean;
}

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

function SubscriptionContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscription-plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        toast.error("Failed to load subscription plans");
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/subscription");
      return;
    }

    setSubscribing(planId);
    const loadingToast = toast.loading("Creating subscription...");

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      toast.dismiss(loadingToast);

      // Load Razorpay script
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const plan = plans.find((p) => p.id === planId);
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Stockey Subscription",
        description: plan?.name || "Subscription",
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyResponse = await fetch("/api/payments/order", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId: data.paymentId,
              }),
            });

            if (verifyResponse.ok) {
              toast.success("Subscription activated successfully!");
              router.push("/subscription/manage");
            } else {
              const error = await verifyResponse.json();
              toast.error(error.error || "Payment verification failed");
            }
          } catch (error) {
            toast.error("Payment verification failed");
            console.error("Payment verification error:", error);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.dismiss(loadingToast);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create subscription";
      toast.error(message);
    } finally {
      setSubscribing(null);
    }
  };

  const formatPrice = (price: number, duration: number) => {
    if (duration === 1) {
      return `₹${price}/month`;
    } else if (duration === 12) {
      return `₹${price}/year`;
    } else {
      return `₹${price} for ${duration} months`;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading subscription plans...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Subscription Plans
      </h1>
      {plans.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">
            No subscription plans available at the moment
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col ${
                plan.active
                  ? "border-2 border-[var(--custom-500)]"
                  : "opacity-60"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                {plan.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-3xl font-bold mb-4">
                  {formatPrice(plan.price, plan.duration)}
                </p>
                <ul className="mb-6 flex-grow space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!plan.active || subscribing === plan.id}
                >
                  {subscribing === plan.id
                    ? "Processing..."
                    : plan.active
                    ? "Subscribe Now"
                    : "Unavailable"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Subscription() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">Loading subscription plans...</div>
        </div>
      }
    >
      <SubscriptionContent />
    </Suspense>
  );
}
