export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & Guide</h1>

      <div className="space-y-8">
        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <p className="text-gray-700 mb-4">
            Byte-Sized Business Boost helps you discover and support local businesses in Richmond, Virginia.
            All features work offline without requiring internet connectivity after the initial setup.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">For Visitors</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Browse:</strong> Explore businesses by category, neighborhood, or search by name</li>
            <li><strong>Reviews:</strong> Read community reviews and write your own (requires simple profile)</li>
            <li><strong>Deals:</strong> Find active coupons and special offers</li>
            <li><strong>Favorites:</strong> Save your favorite businesses for easy access</li>
            <li><strong>Finder:</strong> Use the wizard or natural language search to find perfect matches</li>
            <li><strong>Reports:</strong> Generate data analysis reports and export as CSV</li>
          </ul>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Creating a Profile</h2>
          <p className="text-gray-700 mb-4">
            To write reviews and save favorites, create a simple profile with just a nickname.
            No email or password required - we use a local profile ID stored in your browser.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Navigate to any business detail page</li>
            <li>Click &quot;Write Review&quot; or visit the Favorites page</li>
            <li>When prompted, enter a unique nickname</li>
            <li>Complete the math challenge for security</li>
            <li>Your profile is saved and you can now review and favorite businesses</li>
          </ol>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Writing Reviews</h2>
          <p className="text-gray-700 mb-4">
            Share your experiences with the community by writing honest reviews.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Select a rating from 1 to 5 stars</li>
            <li>Write a descriptive title and detailed comment</li>
            <li>Choose a display name (can be different from your profile nickname)</li>
            <li>Complete the math challenge to verify you&apos;re human</li>
            <li>Reviews are displayed publicly on business pages</li>
          </ul>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Using the Business Finder</h2>
          <p className="text-gray-700 mb-4">
            The Business Finder offers two ways to discover businesses:
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">Wizard Mode</h3>
          <p className="text-gray-700 mb-2">
            Use filters to narrow down your search:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>Category: Food & Dining, Retail, Services, etc.</li>
            <li>Neighborhood: Carytown, Short Pump, The Fan, etc.</li>
            <li>Budget: Low, Medium, or High</li>
            <li>Tags: Family-friendly, Quiet, Study-friendly, Coffee, Outdoor, Affordable</li>
            <li>Deals Only: Show only businesses with active offers</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">Natural Language Search</h3>
          <p className="text-gray-700 mb-2">
            Type natural queries like:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>&quot;cheap coffee in carytown with deals&quot;</li>
            <li>&quot;family friendly restaurant near short pump&quot;</li>
            <li>&quot;quiet study spot with wifi&quot;</li>
            <li>&quot;affordable retail shop downtown&quot;</li>
          </ul>
          <p className="text-gray-700 mt-2">
            The system automatically parses keywords and matches them to filters and tags.
          </p>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports & Data Analysis</h2>
          <p className="text-gray-700 mb-4">
            Generate customizable reports with various filters and export data as CSV:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Top Rated:</strong> Businesses sorted by average rating (with minimum review threshold)</li>
            <li><strong>Most Reviewed:</strong> Businesses with the most community reviews</li>
            <li><strong>Category Distribution:</strong> Count of businesses per category</li>
            <li><strong>Expiring Deals:</strong> Active deals expiring within selected timeframe (3/7/14/30 days)</li>
            <li><strong>Most Favorited:</strong> Businesses saved most often by users</li>
          </ul>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bot Prevention & Security</h2>
          <p className="text-gray-700 mb-4">
            To maintain data quality and prevent spam, we implement multiple bot prevention measures:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Math Challenge:</strong> Simple arithmetic verification for review submission and profile creation</li>
            <li><strong>Honeypot Fields:</strong> Hidden form fields that bots may fill (silently rejected if filled)</li>
            <li><strong>Rate Limiting:</strong> Limits on requests per IP/session to prevent abuse</li>
          </ul>
          <p className="text-gray-700 mt-4">
            All validation happens server-side to ensure security and reliability.
          </p>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Keyboard navigation support throughout the site</li>
            <li>Visible focus indicators for all interactive elements</li>
            <li>High contrast colors for readability</li>
            <li>Semantic HTML with proper ARIA labels</li>
            <li>Screen reader friendly structure</li>
          </ul>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access</h2>
          <p className="text-gray-700 mb-4">
            Business owners and administrators can access the admin dashboard to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Add, edit, and remove businesses</li>
            <li>Manage deals and coupons</li>
            <li>Moderate reviews</li>
            <li>Import/export business data via CSV</li>
            <li>Reset demo data (with confirmation)</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Login credentials: username &quot;admin&quot; and password from <code className="bg-gray-100 px-2 py-1 rounded">ADMIN_PASSWORD</code> environment variable.
          </p>
        </section>

        <section className="card bg-primary-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Details</h2>
          <p className="text-gray-700 mb-4">
            This application is built with modern web technologies:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Framework:</strong> Next.js 14+ with App Router and React</li>
            <li><strong>Language:</strong> TypeScript for type safety</li>
            <li><strong>Database:</strong> SQLite (local file) with Drizzle ORM</li>
            <li><strong>Styling:</strong> Tailwind CSS for responsive design</li>
            <li><strong>Validation:</strong> Zod for input validation</li>
            <li><strong>Offline:</strong> All features work without internet after setup</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
