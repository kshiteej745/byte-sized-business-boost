# Byte-Sized Business Boost

A comprehensive React/Next.js web application for discovering and supporting local businesses in Richmond, Virginia. Built for the FBLA Coding & Programming competition (2025–2026).

## 🎯 Project Overview

**Byte-Sized Business Boost** is an offline-capable business directory and review platform focused on Richmond, VA. The application enables users to browse local businesses, read and write reviews, find deals, save favorites, and generate customizable reports—all without requiring internet connectivity after initial setup.

## 🛠️ Technology Stack

### Why This Stack?

**Next.js 14+ with App Router (React)**: Industry-standard React framework offering server-side rendering, API routes, and optimized performance. App Router provides modern React patterns (Server Components, Streaming) that improve developer experience and user experience.

**TypeScript**: Provides static type checking, catching errors at compile-time, improving code reliability and maintainability. Essential for large-scale applications and team collaboration.

**SQLite with Drizzle ORM**: Lightweight, file-based database perfect for offline applications. SQLite requires no server setup and stores data in a single file (`/data/app.db`). Drizzle ORM provides type-safe database queries and schema migrations.

**Tailwind CSS**: Utility-first CSS framework enabling rapid UI development with consistent, responsive designs. Excellent for accessibility with built-in utilities for focus states and contrast.

**Zod**: Runtime type validation library for TypeScript. Ensures data integrity by validating inputs at both client and server boundaries, preventing invalid data from reaching the database.

**PapaParse (CSV)**: Robust CSV parsing and generation library for admin import/export functionality, enabling easy data management.

## 📋 Prerequisites

- Node.js 18+ and npm
- TypeScript knowledge (for development)
- SQLite (included via better-sqlite3)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create `.env.local` in the root directory:

```env
ADMIN_PASSWORD=your_secure_password_here
```

The default admin username is `admin`.

### 3. Create Database Schema

```bash
npm run db:push
```

This creates the SQLite database file at `/data/app.db` with all necessary tables:
- `businesses`: Business information
- `reviews`: User reviews and ratings
- `profiles`: User profiles (nickname-based)
- `favorites`: User favorited businesses
- `deals`: Deals and coupons

### 4. Seed Sample Data (Optional)

```bash
npm run db:seed
```

This loads `seed/richmond_sample.csv` with 20+ sample businesses from Richmond neighborhoods (Carytown, The Fan, Short Pump, etc.).

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
byte-sized-business-boost/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes (reviews, favorites, admin, etc.)
│   ├── admin/                # Admin dashboard and login
│   ├── browse/               # Business browsing page
│   ├── business/[id]/        # Business detail pages
│   ├── deals/                # Active deals listing
│   ├── favorites/            # User favorites page
│   ├── finder/               # Business finder (wizard + natural language)
│   ├── reports/              # Data analysis and reports
│   ├── help/                 # Help and documentation
│   ├── components/           # Reusable React components
│   ├── layout.tsx            # Root layout with navigation
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── lib/                      # Core libraries
│   ├── db.ts                 # Drizzle ORM database connection
│   ├── schema.ts             # Database schema definitions
│   ├── validators.ts         # Zod validation schemas
│   ├── botguard.ts           # Bot prevention (math challenge, honeypot, rate limiting)
│   ├── recommender.ts        # Business recommendation scoring and natural language parsing
│   └── reports.ts            # Report generation and CSV export
├── seed/                     # Seed data
│   └── richmond_sample.csv   # Sample businesses CSV
├── scripts/                  # Utility scripts
│   └── seed.ts               # Database seeding script
├── data/                     # Runtime data (created on first run)
│   └── app.db                # SQLite database file (gitignored)
└── drizzle/                  # Drizzle migration files (auto-generated)
```

## 🗄️ Database Overview

The application uses SQLite, a serverless, file-based database stored at `/data/app.db`. The database is created automatically on first run via `npm run db:push`.

### Schema

- **businesses**: Core business information (name, category, neighborhood, address, contact info, description, tags)
- **reviews**: User reviews with ratings (1-5 stars), title, body, display name
- **profiles**: Simple user profiles identified by unique nickname
- **favorites**: Many-to-many relationship between profiles and businesses
- **deals**: Business deals/coupons with expiration dates and coupon codes

All tables include timestamps for auditing. Foreign key constraints ensure referential integrity (cascade deletes).

## 🔐 Bot Prevention System

The application implements three layers of bot prevention, all working **offline**:

### 1. Math Challenge Gate
- Random arithmetic problems (addition, subtraction, multiplication)
- Server-side token generation with 5-minute expiration
- Required for review submission and profile creation
- One-time use tokens prevent replay attacks

**Why this works**: Simple for humans, difficult for automated scripts. Server-side validation ensures tokens cannot be bypassed.

### 2. Honeypot Fields
- Hidden form fields invisible to users (CSS: `position: absolute; left: -9999px`)
- Bots often fill all fields, triggering silent rejection
- No error message reveals the honeypot (prevents adaptation)

**Why this works**: Invisible to legitimate users but caught by automated form-filling bots.

### 3. Rate Limiting
- Tracks requests per IP address and session
- Limits: 10 requests per minute per identifier
- Friendly error message: "Too many requests. Please wait..."
- In-memory store (production would use Redis)

**Why this works**: Prevents spam and automated bulk submissions while remaining transparent to legitimate users.

**Note**: All validation occurs server-side. Client-side checks are for UX only.

## 📊 Data Analysis & Reports

The Reports page generates customizable analytics with CSV export:

### Available Reports

1. **Top Businesses by Rating**: Sorted by average rating with minimum review threshold filter
2. **Most Reviewed Businesses**: Businesses with highest review counts
3. **Category Distribution**: Count of businesses per category
4. **Expiring Deals**: Active deals expiring within selected window (3/7/14/30 days)
5. **Most Favorited Businesses**: Businesses saved most often by users

### Filters

- Category (e.g., Food & Dining, Retail, Services)
- Neighborhood (e.g., Carytown, The Fan, Short Pump)
- Date range (start/end dates for reviews)
- Minimum review count
- Active deals only toggle

### CSV Export

All reports can be exported as CSV for external analysis (Excel, Google Sheets, data science tools).

## 🤖 Business Finder (Intelligent Feature)

The Business Finder provides two search modes:

### Wizard Mode
- **Category**: Filter by business type
- **Neighborhood**: Filter by Richmond area
- **Budget**: Low, Medium, High (mapped to tags)
- **Tags**: Family-friendly, Quiet, Study-friendly, Coffee, Outdoor, Affordable
- **Deals Only**: Show only businesses with active coupons

Results are scored based on:
- Match to filters (category, neighborhood)
- Average rating and review count (social proof)
- Tag matches (affordability, atmosphere)
- Active deals (bonus points)

### Natural Language Search
Type queries like:
- "cheap coffee in carytown with deals"
- "family friendly restaurant near short pump"
- "quiet study spot with wifi"

The system parses keywords deterministically (no AI/API calls):
- Categories: "food", "restaurant", "retail", "coffee" → category filters
- Neighborhoods: "carytown", "short pump", "the fan" → neighborhood filters
- Budget: "cheap", "affordable" → low budget tag
- Features: "family-friendly", "quiet", "study" → tag matching

Results include "Because you said..." explanations showing why each business was recommended.

## 👤 Admin Dashboard

Access: `/admin` (requires login)

**Login**: Username `admin`, password from `ADMIN_PASSWORD` environment variable.

### Features

- **Business CRUD**: Create, read, update, delete businesses
- **Deal Management**: Create and manage deals/coupons (UI coming soon)
- **Review Moderation**: Hide/delete reviews (UI coming soon)
- **CSV Import**: Upload businesses from CSV file
- **CSV/JSON Export**: Export businesses, reviews, or deals
- **Reset Demo Data**: Clear all data (with confirmation)

### CSV Import Format

```csv
name,category,neighborhood,address,phone,website,description,tags_csv
Business Name,Food & Dining,Carytown,123 Main St,,,Description here,"tag1,tag2"
```

## ♿ Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Indicators**: Visible focus rings on all buttons, links, and form inputs
- **High Contrast**: WCAG AA compliant color combinations
- **Semantic HTML**: Proper heading hierarchy, ARIA labels, landmark regions
- **Screen Reader Support**: Descriptive alt text, form labels, and ARIA attributes
- **Readable Fonts**: Minimum 16px base font size, scalable with browser zoom

## 🎬 7-Minute Demo Script

### Setup (30 seconds)
1. Open `http://localhost:3000`
2. Point out navigation bar: Home, Browse, Deals, Favorites, Finder, Reports, Help, Admin

### Homepage (30 seconds)
1. Show featured statistics: Total businesses, reviews, active deals
2. Click through a featured business card

### Browse Feature (1 minute)
1. Navigate to Browse page
2. Filter by category (Food & Dining)
3. Filter by neighborhood (Carytown)
4. Sort by highest rating
5. Click on a business to view details

### Business Detail Page (1.5 minutes)
1. Show business information, active deals, reviews
2. **Create Profile**: Click "Write Review" → enter nickname → complete math challenge
3. **Submit Review**: Fill form, complete math challenge, submit
4. Sort reviews (newest, highest, lowest)
5. Click "Add to Favorites" (requires profile)

### Business Finder (1.5 minutes)
1. Navigate to Finder
2. **Wizard Mode**: Select category (Food & Dining), neighborhood (Carytown), tags (family-friendly, deals only) → Show results with scoring
3. **Natural Language**: Type "cheap coffee in carytown with deals" → Show parsed results with "Because you said..." explanations

### Reports (1 minute)
1. Navigate to Reports
2. Select "Top Businesses by Rating"
3. Set filters: Minimum 5 reviews, Category: Food & Dining
4. Generate report → Show table
5. Click "Export CSV" → Download file

### Admin Dashboard (1 minute)
1. Navigate to Admin → Login (username: admin)
2. Show business list
3. Click "Add Business" → Fill form → Submit
4. Edit existing business
5. Export businesses CSV

### Summary (30 seconds)
- Highlight offline capability
- Mention bot prevention
- Emphasize accessibility
- Note Richmond focus

## ❓ Common Judge Q&A

**Q: Why SQLite instead of PostgreSQL or MySQL?**  
A: SQLite is perfect for offline applications—no server setup required, stores data in a single file, and handles concurrent reads well. It's ideal for this competition requirement.

**Q: How does the app work offline?**  
A: All features use local SQLite database. No external API calls. Bot verification uses server-side in-memory stores (math tokens, rate limiting). Everything runs on localhost.

**Q: What happens if the database file is deleted?**  
A: Run `npm run db:push` to recreate schema and `npm run db:seed` to reload sample data. The app handles empty states gracefully.

**Q: How scalable is this solution?**  
A: SQLite handles 100+ concurrent reads. For production scale, migrate to PostgreSQL with connection pooling. Current architecture supports small-to-medium traffic.

**Q: Why Drizzle ORM instead of Prisma or TypeORM?**  
A: Drizzle is lightweight, SQL-like, and excellent for SQLite. It generates type-safe queries with minimal overhead, perfect for this use case.

**Q: How do you prevent SQL injection?**  
A: Drizzle ORM uses parameterized queries automatically. Raw SQL (where used) is constructed with placeholders. Zod validation ensures input types before database queries.

**Q: Explain the recommendation algorithm.**  
A: Deterministic scoring based on filter matches (category, neighborhood, tags), social proof (ratings, review count), and active deals. No machine learning—rules-based matching with weighted scoring.

**Q: How is data validated?**  
A: Zod schemas validate all inputs at API boundaries (server-side). Client-side validation provides immediate feedback, but server validation is authoritative.

**Q: What about XSS prevention?**  
A: Review text is sanitized with HTML escaping (via `sanitizeHtml` utility). React escapes content by default. Server-side sanitization prevents stored XSS.

**Q: How do you handle errors?**  
A: Try-catch blocks in API routes return friendly error messages. Error boundaries (Next.js default) catch React errors. No stack traces exposed to users.

## 📝 Development Notes

### Adding a New Business Category

1. Add category name in admin dashboard or CSV import
2. No schema changes needed (category is a text field)
3. Reports and filters automatically include new categories

### Modifying Bot Prevention

Edit `lib/botguard.ts`:
- Math challenge: Adjust `operand1/operand2` range, add division
- Rate limiting: Modify `RATE_LIMIT_WINDOW` or `RATE_LIMIT_MAX_REQUESTS`
- Honeypot: Add more hidden fields

### Extending Natural Language Parser

Edit `lib/recommender.ts` → `parseNaturalLanguageQuery()`:
- Add keyword patterns for new categories
- Map synonyms to neighborhoods
- Add new tag keywords

## 🐛 Troubleshooting

**Database not found**: Run `npm run db:push` to create schema.

**Seed fails**: Check CSV format. Ensure all required fields (name, category, neighborhood, address) are present.

**Port 3000 in use**: Kill existing process or use `PORT=3001 npm run dev`.

**TypeScript errors**: Run `npm install` to ensure dependencies are installed.

**Build fails**: Check Node.js version (18+). Clear `.next` folder and rebuild.

## 📄 License

This project is built for FBLA competition purposes. See `ATTRIBUTIONS.md` for third-party library licenses.

## 🙏 Acknowledgments

Built for FBLA Coding & Programming 2025–2026 competition. Focused on Richmond, Virginia business community.
