'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const callbackUrl = searchParams?.get('callbackUrl') ?? '';
    const message = searchParams?.get('message');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (status === 'authenticated' && session) {
            if (callbackUrl && !callbackUrl.startsWith('/auth')) {
                router.push(callbackUrl);
            } else if (session.user?.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/user/profile');
            }
        }
    }, [status, session, router, callbackUrl]);

    // Show success message if redirected from signup (only once)
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                const errorMessage = result.error.includes('verify')
                    ? result.error
                    : 'Invalid email or password';
                setError(errorMessage);
                toast.error(errorMessage);
                setLoading(false);
            } else {
                toast.success('Signed in successfully!');

                // Wait a bit for session to be established
                await new Promise(resolve => setTimeout(resolve, 100));

                // Redirect logic
                if (callbackUrl && !callbackUrl.startsWith('/auth')) {
                    router.push(callbackUrl);
                    router.refresh();
                } else {
                    // Fetch session to check role
                    try {
                        const sessionRes = await fetch('/api/auth/session');
                        const sessionData = await sessionRes.json();

                        if (sessionData?.user?.role === 'ADMIN') {
                            router.push('/admin');
                        } else {
                            router.push('/user/profile');
                        }
                        router.refresh();
                    } catch {
                        // Fallback: redirect to dashboard, middleware will handle admin redirect
                        router.push('/user/profile');
                        router.refresh();
                    }
                }
            }
        } catch {
            setError('Something went wrong');
            toast.error('Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--custom-50)] via-white to-[var(--custom-50)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[var(--custom-900)] mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">
                        Sign in to your account to continue
                    </p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-semibold text-center">
                            Sign In
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
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
                                        htmlFor="email"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Email Address
                                    </label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white font-medium shadow-md hover:shadow-lg transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href={callbackUrl ? `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/signup'}
                                    className="font-semibold text-[var(--custom-600)] hover:text-[var(--custom-700)] transition-colors"
                                >
                                    Create one now
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-500">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
}
