import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper function to create slug from tag name
function createTagSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Sample content templates
const blogContent = `
<h2>Introduction</h2>
<p>This is a comprehensive guide that will help you understand the fundamentals and advanced concepts. Whether you're a beginner or an experienced professional, this content will provide valuable insights.</p>

<h2>Key Concepts</h2>
<p>Let's dive into the main concepts that form the foundation of this topic. Understanding these will help you build a solid knowledge base.</p>

<h3>1. Core Principles</h3>
<p>The core principles are essential for mastering this subject. They include:</p>
<ul>
  <li>Fundamental understanding</li>
  <li>Practical application</li>
  <li>Continuous learning</li>
  <li>Best practices</li>
</ul>

<h3>2. Advanced Techniques</h3>
<p>Once you've mastered the basics, you can move on to more advanced techniques that will help you excel in your field.</p>

<h2>Conclusion</h2>
<p>In conclusion, this comprehensive guide covers all the essential aspects you need to know. Practice regularly and keep learning to stay ahead.</p>
`;

const resourceContent = `
<h2>Overview</h2>
<p>This resource provides detailed information and practical examples that you can use in your projects.</p>

<h2>Getting Started</h2>
<p>Follow these steps to get started with this resource:</p>
<ol>
  <li>Read the documentation carefully</li>
  <li>Review the code examples</li>
  <li>Practice with the provided exercises</li>
  <li>Apply the concepts to your own projects</li>
</ol>

<h2>Best Practices</h2>
<p>Here are some best practices to keep in mind:</p>
<ul>
  <li>Always follow coding standards</li>
  <li>Write clean and maintainable code</li>
  <li>Test thoroughly before deployment</li>
  <li>Document your code properly</li>
</ul>
`;

const codeBlockExample = [
  {
    code: `function exampleFunction() {
  console.log('This is an example code block');
  return true;
}`,
    title: "Example Function",
    language: "javascript",
  },
];

async function main() {
  console.log("🌱 Starting seed process...\n");

  // Hash password for users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Categories (8 categories)
  console.log("📁 Creating categories...");
  const categories = [
    {
      name: "Trading Strategies",
      slug: "trading-strategies",
      description: "Learn various trading strategies and techniques",
    },
    {
      name: "Technical Analysis",
      slug: "technical-analysis",
      description: "Master technical analysis and chart patterns",
    },
    {
      name: "Market Insights",
      slug: "market-insights",
      description: "Stay updated with market trends and insights",
    },
    {
      name: "Indicators",
      slug: "indicators",
      description: "Understanding trading indicators and their applications",
    },
    {
      name: "Risk Management",
      slug: "risk-management",
      description: "Learn how to manage risk effectively",
    },
    {
      name: "Psychology",
      slug: "psychology",
      description: "Trading psychology and mindset",
    },
    {
      name: "Tools & Resources",
      slug: "tools-resources",
      description: "Essential tools and resources for traders",
    },
    {
      name: "Beginner Guides",
      slug: "beginner-guides",
      description: "Perfect for beginners starting their trading journey",
    },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    try {
      const category = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
      createdCategories.push(category);
      console.log(`  ✓ Created category: ${category.name}`);
    } catch (error) {
      console.log(`  ⚠ Category ${cat.name} might already exist`);
    }
  }

  // 2. Create Users (20 users)
  console.log("\n👥 Creating users...");
  const users = [];
  for (let i = 1; i <= 20; i++) {
    const userData = {
      email: `user${i}@example.com`,
      password: hashedPassword,
      name: `User ${i}`,
      role: i === 1 ? "ADMIN" : "USER", // First user is admin
    };

    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      });
      users.push(user);
      console.log(`  ✓ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.log(`  ⚠ User ${userData.email} might already exist`);
    }
  }

  // Get admin user (first user or create one)
  let adminUser = users.find((u) => u.role === "ADMIN") || users[0];
  if (!adminUser) {
    adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  }

  // 3. Create Default Tags
  console.log("\n🏷️  Creating default tags...");
  const defaultTags = [
    "beginner",
    "advanced",
    "trading",
    "analysis",
    "strategies",
    "indicators",
    "risk",
    "management",
    "trends",
    "patterns",
    "psychology",
    "mindset",
    "premium",
    "institutional",
    "portfolio",
    "professional",
    "guide",
    "techniques",
    "tools",
    "resources",
  ];

  const createdTags = [];
  for (const tagName of defaultTags) {
    try {
      const tagSlug = createTagSlug(tagName);
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: {
          name: tagName,
          slug: tagSlug,
        },
      });
      createdTags.push(tag);
      console.log(`  ✓ Created tag: ${tag.name}`);
    } catch (error) {
      console.log(`  ⚠ Tag ${tagName} might already exist`);
    }
  }

  // 4. Create Blogs
  console.log("\n📝 Creating blogs...");

  // 3 FREE blogs
  const freeBlogs = [
    {
      title: "Introduction to Trading: A Complete Beginner Guide",
      excerpt:
        "Learn the fundamentals of trading and start your journey in the financial markets.",
      content: blogContent,
      accessType: "FREE",
      price: null,
      category: createdCategories[7] || createdCategories[0], // Beginner Guides
      tags: ["beginner", "trading", "guide"],
    },
    {
      title: "Understanding Market Trends and Patterns",
      excerpt:
        "Discover how to identify and analyze market trends to make better trading decisions.",
      content: blogContent,
      accessType: "FREE",
      price: null,
      category: createdCategories[1] || createdCategories[0], // Technical Analysis
      tags: ["trends", "analysis", "patterns"],
    },
    {
      title: "Essential Risk Management Strategies",
      excerpt:
        "Master the art of risk management to protect your capital and maximize profits.",
      content: blogContent,
      accessType: "FREE",
      price: null,
      category: createdCategories[4] || createdCategories[0], // Risk Management
      tags: ["risk", "management", "strategy"],
    },
  ];

  // 3 PAID blogs
  const paidBlogs = [
    {
      title: "Advanced Trading Strategies for Professionals",
      excerpt:
        "Exclusive strategies used by professional traders to achieve consistent profits.",
      content: blogContent,
      accessType: "PAID",
      price: 299,
      category: createdCategories[0] || createdCategories[0], // Trading Strategies
      tags: ["advanced", "strategies", "professional"],
    },
    {
      title: "Mastering Technical Indicators: Complete Guide",
      excerpt:
        "Deep dive into technical indicators and learn how to use them effectively.",
      content: blogContent,
      accessType: "PAID",
      price: 499,
      category: createdCategories[3] || createdCategories[0], // Indicators
      tags: ["indicators", "technical", "analysis"],
    },
    {
      title: "Market Psychology: Master Your Emotions",
      excerpt:
        "Learn how to control your emotions and develop a winning trading mindset.",
      content: blogContent,
      accessType: "PAID",
      price: 399,
      category: createdCategories[5] || createdCategories[0], // Psychology
      tags: ["psychology", "mindset", "emotions"],
    },
  ];

  // 3 SUBSCRIPTION blogs
  const subscriptionBlogs = [
    {
      title: "Premium Trading System: Complete Framework",
      excerpt:
        "Exclusive premium trading system with proven track record and detailed implementation guide.",
      content: blogContent,
      accessType: "SUBSCRIPTION",
      price: null,
      category: createdCategories[0] || createdCategories[0], // Trading Strategies
      tags: ["premium", "system", "framework"],
    },
    {
      title: "Institutional Trading Secrets Revealed",
      excerpt:
        "Learn the secrets and strategies used by institutional traders and hedge funds.",
      content: blogContent,
      accessType: "SUBSCRIPTION",
      price: null,
      category: createdCategories[2] || createdCategories[0], // Market Insights
      tags: ["institutional", "secrets", "advanced"],
    },
    {
      title: "Advanced Portfolio Management Techniques",
      excerpt:
        "Professional portfolio management strategies for serious traders and investors.",
      content: blogContent,
      accessType: "SUBSCRIPTION",
      price: null,
      category: createdCategories[4] || createdCategories[0], // Risk Management
      tags: ["portfolio", "management", "advanced"],
    },
  ];

  const allBlogs = [...freeBlogs, ...paidBlogs, ...subscriptionBlogs];
  const createdBlogs = [];

  for (let i = 0; i < allBlogs.length; i++) {
    const blog = allBlogs[i];
    const slug = createSlug(blog.title);

    try {
      // Create or get tags
      const tagConnections = [];
      for (const tagName of blog.tags) {
        const tagSlug = createTagSlug(tagName);
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagSlug,
          },
        });
        tagConnections.push({ id: tag.id });
      }

      const createdBlog = await prisma.blog.upsert({
        where: { slug },
        update: {},
        create: {
          title: blog.title,
          slug,
          content: blog.content,
          excerpt: blog.excerpt,
          accessType: blog.accessType,
          price: blog.price,
          published: true,
          publishedAt: new Date(),
          authorId: adminUser.id,
          categoryId: blog.category.id,
          tags: { connect: tagConnections },
        },
      });
      createdBlogs.push(createdBlog);
      console.log(
        `  ✓ Created blog: ${createdBlog.title} (${createdBlog.accessType})`
      );
    } catch (error) {
      console.log(
        `  ⚠ Blog ${blog.title} might already exist: ${error.message}`
      );
    }
  }

  // 5. Create Resources
  console.log("\n📚 Creating resources...");

  // 3 FREE resources
  const freeResources = [
    {
      title: "Free Trading Checklist Template",
      description:
        "A comprehensive checklist template to help you prepare for every trade.",
      content: resourceContent,
      accessType: "FREE",
      price: null,
      category: createdCategories[6] || createdCategories[0], // Tools & Resources
      codeBlocks: codeBlockExample,
    },
    {
      title: "Basic Trading Terminology Guide",
      description:
        "Essential trading terms and definitions every trader should know.",
      content: resourceContent,
      accessType: "FREE",
      price: null,
      category: createdCategories[7] || createdCategories[0], // Beginner Guides
      codeBlocks: codeBlockExample,
    },
    {
      title: "Free Market Analysis Template",
      description:
        "Download our free template for analyzing market conditions.",
      content: resourceContent,
      accessType: "FREE",
      price: null,
      category: createdCategories[1] || createdCategories[0], // Technical Analysis
      codeBlocks: codeBlockExample,
    },
  ];

  // 3 PAID resources
  const paidResources = [
    {
      title: "Advanced Trading Algorithm Collection",
      description:
        "Collection of proven trading algorithms with complete source code and documentation.",
      content: resourceContent,
      accessType: "PAID",
      price: 999,
      category: createdCategories[0] || createdCategories[0], // Trading Strategies
      codeBlocks: codeBlockExample,
    },
    {
      title: "Professional Indicator Library",
      description:
        "Premium collection of custom indicators with implementation guides.",
      content: resourceContent,
      accessType: "PAID",
      price: 799,
      category: createdCategories[3] || createdCategories[0], // Indicators
      codeBlocks: codeBlockExample,
    },
    {
      title: "Risk Management Calculator Tool",
      description:
        "Advanced risk management calculator with multiple strategies and scenarios.",
      content: resourceContent,
      accessType: "PAID",
      price: 599,
      category: createdCategories[4] || createdCategories[0], // Risk Management
      codeBlocks: codeBlockExample,
    },
  ];

  // 3 SUBSCRIPTION resources
  const subscriptionResources = [
    {
      title: "Premium Trading Bot Framework",
      description:
        "Complete framework for building automated trading bots with advanced features.",
      content: resourceContent,
      accessType: "SUBSCRIPTION",
      price: null,
      category: createdCategories[6] || createdCategories[0], // Tools & Resources
      codeBlocks: codeBlockExample,
    },
    {
      title: "Institutional Trading Dashboard",
      description:
        "Professional trading dashboard with real-time analytics and reporting.",
      content: resourceContent,
      accessType: "SUBSCRIPTION",
      price: null,
      category: createdCategories[2] || createdCategories[0], // Market Insights
      codeBlocks: codeBlockExample,
    },
    {
      title: "Advanced Backtesting Suite",
      description:
        "Comprehensive backtesting suite for testing and optimizing trading strategies.",
      content: resourceContent,
      accessType: "SUBSCRIPTION",
      price: null,
      category: createdCategories[0] || createdCategories[0], // Trading Strategies
      codeBlocks: codeBlockExample,
    },
  ];

  const allResources = [
    ...freeResources,
    ...paidResources,
    ...subscriptionResources,
  ];
  const createdResources = [];

  for (let i = 0; i < allResources.length; i++) {
    const resource = allResources[i];
    const slug = createSlug(resource.title);

    try {
      const createdResource = await prisma.resource.upsert({
        where: { slug },
        update: {},
        create: {
          title: resource.title,
          slug,
          description: resource.description,
          content: resource.content,
          accessType: resource.accessType,
          price: resource.price,
          published: true,
          publishedAt: new Date(),
          authorId: adminUser.id,
          categoryId: resource.category.id,
          codeBlocks: resource.codeBlocks,
        },
      });
      createdResources.push(createdResource);
      console.log(
        `  ✓ Created resource: ${createdResource.title} (${createdResource.accessType})`
      );
    } catch (error) {
      console.log(
        `  ⚠ Resource ${resource.title} might already exist: ${error.message}`
      );
    }
  }

  // 6. Create Subscription Plans
  console.log("\n💳 Creating subscription plans...");
  const subscriptionPlans = [
    {
      name: "Basic Plan",
      description:
        "Perfect for beginners who want to start their trading journey",
      price: 299,
      duration: 1, // 1 month
      features: [
        "Access to all free content",
        "Basic trading strategies",
        "Email support",
        "Weekly market updates",
        "Basic indicators access",
      ],
      active: true,
    },
    {
      name: "Premium Plan",
      description: "For serious traders who want advanced features and tools",
      price: 799,
      duration: 1, // 1 month
      features: [
        "Everything in Basic Plan",
        "Access to all premium content",
        "Advanced trading strategies",
        "Priority email support",
        "Daily market analysis",
        "Custom indicators library",
        "Trading bot templates",
        "Risk management tools",
      ],
      active: true,
    },
    {
      name: "Pro Plan",
      description: "Ultimate plan for professional traders and institutions",
      price: 1499,
      duration: 1, // 1 month
      features: [
        "Everything in Premium Plan",
        "Access to all exclusive content",
        "Institutional trading strategies",
        "24/7 priority support",
        "Real-time market alerts",
        "Advanced backtesting suite",
        "Portfolio management tools",
        "Live trading sessions",
        "Personal trading coach access",
      ],
      active: true,
    },
    {
      name: "Premium Yearly",
      description: "Save 20% with annual subscription - Best value!",
      price: 7990, // 799 * 12 * 0.83 (approx 17% discount)
      duration: 12, // 12 months
      features: [
        "Everything in Premium Plan",
        "Access to all premium content",
        "Advanced trading strategies",
        "Priority email support",
        "Daily market analysis",
        "Custom indicators library",
        "Trading bot templates",
        "Risk management tools",
        "Save 20% compared to monthly",
      ],
      active: true,
    },
    {
      name: "Pro Yearly",
      description: "Save 25% with annual subscription - Maximum savings!",
      price: 13490, // 1499 * 12 * 0.75 (25% discount)
      duration: 12, // 12 months
      features: [
        "Everything in Pro Plan",
        "Access to all exclusive content",
        "Institutional trading strategies",
        "24/7 priority support",
        "Real-time market alerts",
        "Advanced backtesting suite",
        "Portfolio management tools",
        "Live trading sessions",
        "Personal trading coach access",
        "Save 25% compared to monthly",
      ],
      active: true,
    },
  ];

  const createdPlans = [];
  for (const plan of subscriptionPlans) {
    try {
      const createdPlan = await prisma.subscriptionPlan.upsert({
        where: { name: plan.name },
        update: {},
        create: plan,
      });
      createdPlans.push(createdPlan);
      console.log(
        `  ✓ Created plan: ${createdPlan.name} - ₹${createdPlan.price} (${
          createdPlan.duration
        } month${createdPlan.duration > 1 ? "s" : ""})`
      );
    } catch (error) {
      console.log(`  ⚠ Plan ${plan.name} might already exist`);
    }
  }

  console.log("\n✅ Seed completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   - Categories: ${createdCategories.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Tags: ${createdTags.length}`);
  console.log(
    `   - Blogs: ${createdBlogs.length} (3 FREE, 3 PAID, 3 SUBSCRIPTION)`
  );
  console.log(
    `   - Resources: ${createdResources.length} (3 FREE, 3 PAID, 3 SUBSCRIPTION)`
  );
  console.log(`   - Subscription Plans: ${createdPlans.length}`);
  console.log(`\n🔑 Login credentials:`);
  console.log(`   - Admin: user1@example.com / password123`);
  console.log(
    `   - Users: user2@example.com to user20@example.com / password123`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
