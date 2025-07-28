# HoopMetrix - Basketball Encyclopedia & E-commerce Platform

A comprehensive basketball encyclopedia and e-commerce platform featuring NBA and WNBA players, teams, and merchandise with premium membership functionality.

## 🏀 Features

### **Basketball Encyclopedia**
- **500+ NBA Players** with stats, photos, and detailed profiles
- **144+ WNBA Players** with comprehensive career information
- **All NBA/WNBA Teams** with rosters, logos, and team information
- **Custom Teams & Players** - Create and manage your own teams and players
- **Real-time Data Sync** - Automated daily updates from official NBA/WNBA APIs
- **Advanced Search & Filtering** - Find players by team, position, league, and more

### **E-commerce Platform**
- **Basketball Merchandise Store** - Jerseys, equipment, and accessories
- **Shopping Cart System** - Persistent cart across devices when logged in
- **Stripe Integration** - Secure payment processing
- **Order Management** - Complete order tracking and history
- **Account-based Cart** - Cart syncs across desktop and mobile

### **Membership System**
- **Free Tier** - Basic player profiles and team information
- **Premium Membership ($10/month)** - Complete access to all features
- **Stripe Subscriptions** - Automatic billing and subscription management
- **Account Dashboard** - Manage subscription and view order history

### **Admin Dashboard**
- **Team Management** - Create and edit custom teams with drag & drop logo upload
- **Player Management** - Add custom players with drag & drop headshot upload
- **Product Management** - Manage store inventory and pricing
- **Order Management** - View and process customer orders
- **User Management** - Admin user controls and permissions
- **Analytics** - Store and user statistics

### **Modern User Experience**
- **Mobile-First Design** - Responsive across all devices
- **Glassmorphism UI** - Modern, sleek interface design
- **Smooth Animations** - Framer Motion powered interactions
- **Dark Mode Compatible** - Elegant design that works in any theme
- **Fast Performance** - Optimized loading and caching

## 🛠 Technology Stack

- **Framework**: Next.js 15.4.3 with TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase with PostgreSQL
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Data Source**: NBA.com/WNBA.com public APIs

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account
- Stripe account
- Resend account (for emails)

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (Payments & Subscriptions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Resend (Email Service)
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
CRON_SECRET=generate_random_string_here
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hoop-metrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the schema from `supabase/schema.sql`
   - Add your environment variables

4. **Configure Stripe**
   - Create products for membership tiers
   - Set up webhook endpoints
   - Add API keys to environment variables

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Initialize data (optional)**
   ```bash
   # Sync NBA/WNBA data
   npm run sync-data
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
/app                    # Next.js app directory
  /admin               # Admin dashboard pages
  /api                 # API routes
    /admin             # Admin management APIs
    /cart              # Shopping cart APIs
    /cron              # Automated sync jobs
  /auth                # Authentication pages
  /shop                # E-commerce pages
  /teams               # Team listing and details
  /players             # Player listing and details
/components            # React components
  /admin               # Admin-specific components
  /auth                # Authentication components
  /layout              # Layout components (nav, footer)
  /shop                # E-commerce components
  /ui                  # Reusable UI components
/lib                   # Utility libraries
  /auth                # Authentication logic
  /contexts            # React contexts
  /types               # TypeScript definitions
  /utils               # Helper functions
/scripts               # Data sync scripts
/supabase              # Database schema and migrations
```

## 🔄 Data Synchronization

The application automatically syncs NBA and WNBA data daily at 2 AM EST using Vercel Cron Jobs:

- **Teams**: All NBA and WNBA teams with logos and information
- **Players**: Current rosters with stats and photos
- **Real-time Updates**: Keeps data current throughout the season

## 💳 Payment Integration

Complete Stripe integration with:

- **Subscription Management**: $10/month premium membership
- **One-time Payments**: Individual product purchases
- **Webhook Processing**: Automatic subscription status updates
- **Customer Portal**: Self-service billing management

## 🔐 Authentication & Authorization

- **Supabase Auth**: Email/password authentication
- **Role-based Access**: User and admin roles
- **Protected Routes**: Admin dashboard and premium content
- **Session Management**: Persistent login across devices

## 📱 Mobile Experience

Designed with mobile-first principles:

- **Responsive Design**: Works perfectly on all screen sizes
- **Touch Optimized**: Easy navigation on mobile devices
- **Fast Loading**: Optimized images and lazy loading
- **Progressive Web App**: Can be installed on mobile devices

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically handle builds and cron jobs
4. **Configure custom domain** (optional)

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run sync-data       # Manually sync NBA/WNBA data

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript types
```

## 📊 Features Overview

| Feature | Free Tier | Premium ($10/month) |
|---------|-----------|-------------------|
| Player Profiles | Basic info | Complete stats & history |
| Team Information | Basic details | Full rosters & analytics |
| Store Access | Browse only | Full shopping access |
| Custom Content | View only | Create teams & players |
| Advanced Search | Limited | Full search capabilities |
| Mobile App | Basic features | Complete experience |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Live Site**: [Coming Soon]
- **Documentation**: [See CLAUDE.md](./CLAUDE.md)
- **API Documentation**: [Coming Soon]

## 📞 Support

For questions or support, please contact [your-email@domain.com]

---

Built with ❤️ and 🏀 by the HoopMetrix team