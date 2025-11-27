'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

// Password strength checker
function getPasswordStrength(password: string): { strength: 'weak' | 'medium' | 'strong'; score: number; feedback: string } {
    if (password.length === 0) {
        return { strength: 'weak', score: 0, feedback: '' };
    }

    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 6) score += 1;
    else feedback.push('At least 6 characters');

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    if (score <= 2) {
        return { strength: 'weak', score, feedback: feedback.length > 0 ? feedback[0] : 'Too short' };
    } else if (score <= 4) {
        return { strength: 'medium', score, feedback: '' };
    } else {
        return { strength: 'strong', score, feedback: '' };
    }
}

function SignUpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    let callbackUrl = searchParams?.get('callbackUrl') ?? '';
    // Prevent redirect loop if callbackUrl points to signup itself
    if (callbackUrl === '/auth/signup') callbackUrl = '';

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

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Calculate password strength
    const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Something went wrong');
                toast.error(data.error || 'Something went wrong');
                return;
            }

            toast.success('Account created successfully! Please verify your email.');

            // Redirect to OTP verification page
            const verifyUrl = callbackUrl
                ? `/auth/verify?email=${encodeURIComponent(formData.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
                : `/auth/verify?email=${encodeURIComponent(formData.email)}`;

            router.push(verifyUrl);
        } catch {
            setError('Something went wrong');
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--custom-50)] via-white to-[var(--custom-50)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[var(--custom-900)] mb-2">
                        Get Started
                    </h1>
                    <p className="text-gray-600">
                        Create your account to access all features
                    </p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-semibold text-center">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-center">
                            Fill in your details to get started
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
                                        htmlFor="name"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Full Name
                                    </label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="h-11"
                                    />
                                </div>

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
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="At least 6 characters"
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
                                    {formData.password && (
                                        <div className="space-y-1">
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-1.5 flex-1 rounded ${passwordStrength.strength === 'weak' && level === 1
                                                            ? 'bg-red-500'
                                                            : passwordStrength.strength === 'medium' && level <= 2
                                                                ? 'bg-yellow-500'
                                                                : passwordStrength.strength === 'strong' && level <= 3
                                                                    ? 'bg-green-500'
                                                                    : 'bg-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-xs ${passwordStrength.strength === 'weak'
                                                ? 'text-red-600'
                                                : passwordStrength.strength === 'medium'
                                                    ? 'text-yellow-600'
                                                    : 'text-green-600'
                                                }`}>
                                                {passwordStrength.strength === 'weak' && passwordStrength.feedback
                                                    ? `Weak: ${passwordStrength.feedback}`
                                                    : passwordStrength.strength === 'medium'
                                                        ? 'Medium strength'
                                                        : passwordStrength.strength === 'strong'
                                                            ? 'Strong password'
                                                            : ''}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="Confirm your password"
                                            className="h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                        <p className="text-xs text-red-600">Passwords do not match</p>
                                    )}
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
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    href={callbackUrl ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/signin'}
                                    className="font-semibold text-[var(--custom-600)] hover:text-[var(--custom-700)] transition-colors"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-500">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>}>
            <SignUpContent />
        </Suspense>
    );
}
