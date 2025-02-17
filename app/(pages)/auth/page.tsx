"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

type FormData = {
    name?: string
    email: string
    password: string
}

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

    const onSubmit = (data: FormData) => {
        console.log(data)
        // Handle form submission
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Image
                    src="/bg-mob.png"
                    alt="Logo"
                    width={100}
                    height={40}
                    className="mx-auto"
                />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--foreground)]">
                    {isLogin ? "Sign in to your account" : "Create your account"}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[var(--background)] py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <div className="mt-1 relative">
                                    <Input
                                        id="name"
                                        type="text"
                                        {...register("name", { required: !isLogin })}
                                        className="pl-10"
                                    />
                                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">Name is required</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email", {
                                        required: true,
                                        pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    })}
                                    className="pl-10"
                                />
                                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">Valid email is required</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", { required: true, minLength: 6 })}
                                    className="pl-10 pr-10"
                                />
                                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    Password must be at least 6 characters
                                </p>
                            )}
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-end">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-[var(--custom-600)] hover:text-[var(--custom-700)]">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-[var(--custom-600)] hover:bg-[var(--custom-700)]">
                            {isLogin ? "Sign in" : "Register"}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[var(-background)] text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="button"
                                className="w-full flex justify-center items-center gap-2 bg-[var(-background)] text-gray-700 border border-gray-300 hover:bg-gray-50"
                            >
                                <Image
                                    src="/images/google.svg"
                                    alt="Google"
                                    width={20}
                                    height={20}
                                />
                                Sign in with Google
                            </Button>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-[var(--custom-600)] hover:text-[var(--custom-700)]">

                            {isLogin ? "Register" : "Sign in"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}