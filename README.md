# Blog Platform with Admin Panel

Complete blog platform with admin panel, user authentication, payment integration, and subscription management.

## Features

### 🔐 Authentication
- Email/Password authentication with NextAuth
- User roles: USER and ADMIN
- Protected routes with middleware

### 📝 Content Management
- **Blogs**: Create, edit, publish/unpublish blogs
- **Resources**: Create resources with code blocks support
- **Categories**: Organize content with categories
- **Access Control**: FREE, PAID (one-time), and SUBSCRIPTION-based content

### 💳 Payment Integration
- Razorpay payment gateway integration
- One-time payments for premium blogs and resources
- Subscription management
- User purchase history

### 👤 User Features
- View purchased blogs and resources
- Manage subscriptions
- Cancel subscriptions
- Profile page with purchase history

### 🛠️ Admin Features
- Full CRUD operations for blogs and resources
- Category management
- Publish/unpublish content
- View all content (published and drafts)

### 🔍 SEO
- Meta titles and descriptions
- Keywords support
- SEO-friendly URLs with slugs

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Razorpay
- **UI**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **Markdown**: react-markdown

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Database Setup

The project uses Prisma Postgres (local development):

\`\`\`bash
# Prisma Postgres is already initialized
# Your DATABASE_URL is already set in .env
\`\`\`

### 3. Environment Variables

Update the `.env` file with your credentials:

\`\`\`env
# Database - Already configured with Prisma Postgres
DATABASE_URL="prisma+postgres://..."

# NextAuth - Generate a secret key
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-min-32-characters"

# Razorpay - Get from https://user/profile.razorpay.com/
RAZORPAY_KEY_ID="your_key_id"
RAZORPAY_KEY_SECRET="your_key_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_key_id"

# Subscription
SUBSCRIPTION_PLAN_ID="plan_id_from_razorpay"
SUBSCRIPTION_MONTHLY_PRICE="499"
\`\`\`

### 4. Generate Prisma Client and Run Migrations

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
\`\`\`

### 5. Create Admin User

Run this to create your first admin user:

\`\`\`bash
npx prisma studio
\`\`\`

Then manually create a user with:
- Email: admin@example.com
- Password: Hash of your password (use bcrypt)
- Role: ADMIN

Or use the signup API and then update the role in Prisma Studio.

### 6. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

## Project Structure

\`\`\`
blog-site/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth & signup
│   │   ├── admin/         # Admin APIs (blogs, resources, categories)
│   │   ├── blogs/         # Public blog APIs
│   │   ├── payments/      # Payment APIs
│   │   ├── subscriptions/ # Subscription APIs
│   │   └── user/          # User profile API
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Sign in/up pages
│   ├── blogs/             # Public blog pages
│   ├── user/              # User profile page
│   └── layout.tsx         # Root layout with AuthProvider
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth-provider.tsx  # NextAuth SessionProvider wrapper
│   └── nav-menu.tsx       # Navigation with auth status
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── config.ts          # Centralized environment config
│   ├── prisma.ts          # Prisma client
│   └── razorpay.ts        # Razorpay instance
├── prisma/
│   └── schema.prisma      # Database schema
├── middleware.ts          # Route protection
└── .env                   # Environment variables
\`\`\`

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Sign in (via NextAuth)

### Admin - Blogs
- `GET /api/admin/blogs` - Get all blogs
- `POST /api/admin/blogs` - Create blog
- `GET /api/admin/blogs/[id]` - Get blog by ID
- `PUT /api/admin/blogs/[id]` - Update blog
- `DELETE /api/admin/blogs/[id]` - Delete blog

### Admin - Resources
- `GET /api/admin/resources` - Get all resources
- `POST /api/admin/resources` - Create resource
- `GET /api/admin/resources/[id]` - Get resource by ID

### Admin - Categories
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category

### Public - Blogs
- `GET /api/blogs` - Get published blogs (with pagination)
- `GET /api/blogs/[slug]` - Get blog by slug (with access control)

### Payments
- `POST /api/payments/order` - Create Razorpay order
- `PUT /api/payments/order` - Verify payment

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - Get user subscriptions
- `DELETE /api/subscriptions/[id]` - Cancel subscription

### User
- `GET /api/user/profile` - Get user profile with purchases

## Usage Guide

### For Admins

1. **Sign in** at `/auth/signin` with admin credentials
2. **Access Admin Dashboard** at `/admin`
3. **Create Categories** for organizing content
4. **Create Blogs** with access type (FREE/PAID/SUBSCRIPTION)
5. **Publish/Unpublish** content as needed
6. **Create Resources** with code blocks

### For Users

1. **Sign up** at `/auth/signup`
2. **Browse Blogs** at `/blogs`
3. **Purchase** paid blogs or subscribe for premium content
4. **View Profile** at `/user/profile` to see purchases
5. **Manage Subscriptions** - cancel anytime

## Database Schema

### Key Models:
- **User**: User accounts with role (USER/ADMIN)
- **Blog**: Blog posts with SEO fields
- **Resource**: Resources with code blocks
- **Category**: Content categories
- **Payment**: Payment transactions
- **Subscription**: User subscriptions
- **BlogPurchase**: One-time blog purchases
- **ResourcePurchase**: One-time resource purchases

## Payment Flow

1. User selects paid content
2. Frontend calls `/api/payments/order`
3. Backend creates Razorpay order
4. Frontend opens Razorpay checkout
5. User completes payment
6. Frontend verifies payment via `/api/payments/order` (PUT)
7. Backend creates purchase record
8. User gets access to content

## Security Features

- Password hashing with bcrypt
- JWT-based sessions with NextAuth
- Protected API routes
- CSRF protection
- Environment variable management
- Role-based access control

## Development Tips

1. **Database Changes**: Run `npx prisma migrate dev` after schema changes
2. **View Database**: Use `npx prisma studio`
3. **Reset Database**: Use `npx prisma migrate reset` (development only)
4. **Generate Types**: Run `npx prisma generate` after schema changes

## Production Deployment

1. Set all environment variables
2. Run database migrations
3. Build the application: `npm run build`
4. Start production server: `npm start`

## TODO / Future Enhancements

- [ ] Add Google OAuth
- [ ] Email notifications
- [ ] Image upload for blog covers
- [ ] Rich text editor for blog creation
- [ ] Comments system
- [ ] Blog analytics
- [ ] Newsletter integration
- [ ] Search functionality
- [ ] Tags support
- [ ] Social sharing

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
