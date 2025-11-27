"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  features: string[];
  active: boolean;
}

export default function ComparePlans() {
  const router = useRouter();
  const { data: session } = useSession();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/subscription-plans");
      if (response.ok) {
        const data = await response.json();
        // Filter only active plans and sort by price
        const activePlans = (data.plans || [])
          .filter((p: SubscriptionPlan) => p.active)
          .sort(
            (a: SubscriptionPlan, b: SubscriptionPlan) => a.price - b.price
          );
        setPlans(activePlans);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/subscription");
      return;
    }
    router.push("/subscription");
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading plans...</div>
      </div>
    );
  }

  // Free plan (always available)
  const freePlan = {
    title: "Free",
    price: "₹0/month",
    features: [
      "Basic market analysis",
      "Limited access to trading resources",
      "Public forum access",
      "Email support",
      "Free blog posts",
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center text-[var(--custom-500)]">
        Free vs Premium
      </h1>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{freePlan.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">{freePlan.price}</p>
            <ul className="mb-6 space-y-2">
              {freePlan.features.map((feature, index) => (
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
              className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
              onClick={() => router.push("/auth/signup")}
            >
              Sign Up Free
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plans */}
        {plans.map((plan) => (
          <Card key={plan.id} className="border-2 border-[var(--custom-500)]">
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              {plan.description && (
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">
                {formatPrice(plan.price, plan.duration)}
              </p>
              <ul className="mb-6 space-y-2">
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
                className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)]"
                onClick={handleSubscribe}
              >
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
