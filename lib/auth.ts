import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { config } from '@/lib/config';

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/auth/signin',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password required');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error('Invalid credentials');
                }

                // Check if user is banned
                if (user.banned) {
                    throw new Error('Your account has been banned. Please contact support.');
                }

                // Check if email is verified
                if (!user.emailVerified) {
                    throw new Error('Please verify your email address before signing in. Check your inbox for the OTP.');
                }

                // Check if password is a verification token (format: VERIFY_TOKEN_<token>)
                if (credentials.password.startsWith('VERIFY_TOKEN_')) {
                    const token = credentials.password.replace('VERIFY_TOKEN_', '');
                    
                    // Check if verification token matches and is not expired
                    if (user.verificationToken === token && 
                        user.verificationTokenExpires && 
                        user.verificationTokenExpires > new Date()) {
                        // Clear verification token after use
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                verificationToken: null,
                                verificationTokenExpires: null,
                            },
                        });
                        
                        // Return user for login
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                        };
                    } else {
                        throw new Error('Invalid or expired verification token');
                    }
                }

                // Normal password check
                const isPasswordValid = await compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    secret: config.auth.secret,
};
