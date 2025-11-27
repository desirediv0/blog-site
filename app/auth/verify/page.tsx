"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const callbackUrl = searchParams?.get("callbackUrl") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push("/auth/signup");
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid OTP");
        toast.error(data.error || "Invalid OTP");
        setLoading(false);
        return;
      }

      // Auto-login the user after successful verification
      toast.success("Email verified successfully! Logging you in...");

      // Use verification token to login directly
      if (data.verificationToken) {
        try {
          // Use NextAuth signIn with verification token
          const result = await signIn("credentials", {
            email,
            password: `VERIFY_TOKEN_${data.verificationToken}`,
            redirect: false,
          });

          if (result?.error) {
            // If auto-login fails, redirect to signin
            setLoading(false);
            toast.error("Auto-login failed. Please sign in manually.");
            const signinUrl = callbackUrl
              ? `/auth/signin?message=Email verified successfully. Please sign in.&callbackUrl=${encodeURIComponent(
                  callbackUrl
                )}`
              : "/auth/signin?message=Email verified successfully. Please sign in.";
            router.push(signinUrl);
            return;
          }

          // Wait a bit for session to be established
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Redirect based on role or callback
          if (callbackUrl && !callbackUrl.startsWith("/auth")) {
            router.push(callbackUrl);
            router.refresh();
          } else {
            // Fetch session to check role
            try {
              const sessionRes = await fetch("/api/auth/session");
              const sessionData = await sessionRes.json();

              if (sessionData?.user?.role === "ADMIN") {
                router.push("/admin");
              } else {
                router.push("/user/profile");
              }
              router.refresh();
            } catch {
              router.push("/user/profile");
              router.refresh();
            }
          }
        } catch (error) {
          console.error("Auto-login error:", error);
          setLoading(false);
          toast.error("Auto-login failed. Please sign in manually.");
          // Fallback to signin page
          const signinUrl = callbackUrl
            ? `/auth/signin?message=Email verified successfully. Please sign in.&callbackUrl=${encodeURIComponent(
                callbackUrl
              )}`
            : "/auth/signin?message=Email verified successfully. Please sign in.";
          router.push(signinUrl);
        }
      } else {
        // Fallback if no verification token
        setLoading(false);
        toast.error(
          "Verification token not received. Please sign in manually."
        );
        const signinUrl = callbackUrl
          ? `/auth/signin?message=Email verified successfully. Please sign in.&callbackUrl=${encodeURIComponent(
              callbackUrl
            )}`
          : "/auth/signin?message=Email verified successfully. Please sign in.";
        router.push(signinUrl);
      }
    } catch {
      setError("Something went wrong");
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend OTP");
        toast.error(data.error || "Failed to resend OTP");
        setResendLoading(false);
        return;
      }

      toast.success("OTP sent successfully!");
      setCountdown(60); // 60 seconds cooldown
      setResendLoading(false);
    } catch {
      setError("Something went wrong");
      toast.error("Something went wrong");
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--custom-50)] via-white to-[var(--custom-50)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--custom-900)] mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We&apos;ve sent a 6-digit OTP to your email
          </p>
          {email && <p className="text-sm text-gray-500 mt-2">{email}</p>}
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">
              Enter OTP
            </CardTitle>
            <CardDescription className="text-center">
              Please enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="text-sm font-medium text-gray-700"
                  >
                    OTP Code
                  </label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    className="h-14 text-center text-2xl font-bold tracking-widest"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Enter the 6-digit code
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white font-medium shadow-md hover:shadow-lg transition-all"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading || countdown > 0}
                  className="text-sm text-[var(--custom-600)] hover:text-[var(--custom-700)] font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendLoading
                    ? "Sending..."
                    : countdown > 0
                    ? `Resend OTP in ${countdown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the email?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading || countdown > 0}
                  className="font-semibold text-[var(--custom-600)] hover:text-[var(--custom-700)] transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Resend
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/auth/signin"
            className="text-sm text-gray-600 hover:text-[var(--custom-600)] transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          Loading...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
