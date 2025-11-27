/**
 * Centralized configuration file for all environment variables
 * Use this file to access all env variables across the application
 *
 * Note: For client-side variables (NEXT_PUBLIC_*), use process.env directly
 * Example: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID (in client components)
 */

export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || "",
  },

  // NextAuth
  auth: {
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    secret: process.env.NEXTAUTH_SECRET || "",
  },

  // Razorpay (Server-side only)
  // For client-side, use: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    publicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", // For reference only
  },

  // App
  app: {
    url: process.env.APP_URL || "http://localhost:3000",
    adminEmail: process.env.ADMIN_EMAIL || "admin@example.com",
  },

  // Email (Brevo SMTP - formerly Sendinblue)
  // Get credentials from: https://app.brevo.com/settings/keys/api
  smtp: {
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    user: process.env.SMTP_USER || "", // Your Brevo SMTP login email
    pass: process.env.SMTP_PASS || "", // Your Brevo SMTP key (not API key)
  },

  // DigitalOcean Spaces Configuration
  // Get credentials from: https://cloud.digitalocean.com/account/api/spaces
  s3: {
    endpoint:
      process.env.SPACES_ENDPOINT || "https://sgp1.digitaloceanspaces.com",
    region: process.env.SPACES_REGION || "sgp1",
    accessKey: process.env.SPACES_ACCESS_KEY || "",
    secretKey: process.env.SPACES_SECRET_KEY || "",
    bucket: process.env.SPACES_BUCKET || "",
    cdnUrl: process.env.SPACES_CDN_URL || "",
  },

  // Upload Folder Configuration
  // For S3/Spaces: Use folder name directly (e.g., "Blog-data")
  // For Local: Use "public/uploads" or "uploads"
  // Set UPLOAD_FOLDER in .env (e.g., "Blog-data" for S3 or "public/uploads" for local)
  upload: {
    folder: process.env.UPLOAD_FOLDER || "Blog-data",
    maxSize: Number(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024, // 5MB
  },
} as const;

// Type-safe config accessor
export type Config = typeof config;

// Validate required environment variables
export function validateEnv() {
  const required = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      "Please check your .env file."
    );
  }
}
