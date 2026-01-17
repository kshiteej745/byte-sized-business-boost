export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-heading font-semibold text-gray-900 mb-2">
        How Neighborly works
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        Everything you need to know about using Neighborly
      </p>

      <div className="space-y-8">
        <section className="card">
          <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-4">
            Getting started
          </h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900">Q: What is Neighborly?</p>
              <p>
                A: Neighborly helps you discover and support local businesses in Richmond.
                Once you’re set up, everything works offline—no internet needed.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Q: What can I do as a neighbor?</p>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="font-semibold text-gray-900">A: Browse.</span> Search by what
                  you’re looking for or where you are.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Read + write reviews.</span>{" "}
                  See what neighbors are saying and share your own (you’ll make a simple profile).
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Find deals.</span> Discover
                  coupons and special offers from local spots.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Save favorites.</span>{" "}
                  Bookmark places you want to come back to.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Use the Finder.</span>{" "}
                  Try the wizard or just describe what you want in plain English.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Generate reports.</span>{" "}
                  Explore the data or export it for your own analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-4">
            Creating your profile
          </h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900">Q: Do I need an account?</p>
              <p>
                A: Only if you want to write reviews or save favorites. You’ll create a simple
                profile with a nickname—no email, no password. We store a local ID in your browser.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Q: How do I create a profile?</p>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>Go to any business page</li>
                <li>Click “Write Review” or visit the Favorites page</li>
                <li>Enter a unique nickname when prompted</li>
                <li>Solve a quick math problem (keeps out bots)</li>
                <li>You’re set—start reviewing and saving places</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-4">
            Writing reviews
          </h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900">Q: What should I include in a review?</p>
              <p>A: Anything useful to a neighbor: what you got, how it was, and what stood out.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Q: How do I submit a review?</p>
              <div className="mt-2 space-y-2">
                <p>A: Pick a rating from 1 to 5 stars.</p>
                <p>A: Write a short title + a detailed comment.</p>
                <p>A: Choose a display name (it can be different from your profile nickname).</p>
                <p>A: Complete the math challenge to verify you’re human.</p>
                <p>A: Your review shows up publicly on that business page.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Using the Business Finder
          </h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900">Q: How do I find businesses?</p>
              <p>A: You’ve got two options: Wizard Mode or Natural Language Search.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Q: What is Wizard Mode?</p>
              <p className="mt-1">
                A: You tap through filters to narrow your search (great when you want to be
                specific).
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Category: Food & Dining, Retail, Services, etc.</li>
                <li>Neighborhood: Carytown, Short Pump, The Fan, etc.</li>
                <li>Budget: Low, Medium, or High</li>
                <li>Tags: Family-friendly, Quiet, Study-friendly, Coffee, Outdoor, Affordable</li>
                <li>Deals Only: Show only businesses with active offers</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Q: What is Natural Language Search?</p>
              <p className="mt-1">
                A: You type what you want in plain English and we translate it into filters + tags.
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>&quot;cheap coffee in carytown with deals&quot;</li>
                <li>&quot;family friendly restaurant near short pump&quot;</li>
                <li>&quot;quiet study spot with wifi&quot;</li>
                <li>&quot;affordable retail shop downtown&quot;</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports & Data Analysis</h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900">Q: What are reports for?</p>
              <p>
                A: Reports help you summarize what’s in the directory—then export it as CSV if you
                want.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Q: What kinds of reports can I generate?</p>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="font-semibold text-gray-900">A: Top Rated.</span> Businesses
                  sorted by average rating (with a minimum review threshold).
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Most Reviewed.</span> Businesses
                  with the most community reviews.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Category Distribution.</span>{" "}
                  Count of businesses per category.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Expiring Deals.</span> Active
                  deals expiring within 3/7/14/30 days.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Most Favorited.</span> Businesses
                  saved most often by users.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bot Prevention & Security</h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900">Q: Why is there a math challenge?</p>
              <p>
                A: It’s a quick way to reduce spam and keep reviews/favorites higher quality.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Q: What anti-bot protections are used?</p>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="font-semibold text-gray-900">A: Math Challenge.</span> Simple
                  arithmetic verification for profile creation and review submission.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Honeypot Fields.</span> Hidden
                  form fields that bots often fill (silently rejected if filled).
                </p>
                <p>
                  <span className="font-semibold text-gray-900">A: Rate Limiting.</span> Limits
                  requests per IP/session to prevent abuse.
                </p>
              </div>
              <p className="mt-3">
                A: All validation happens server-side for reliability.
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900">Q: What accessibility features are included?</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Keyboard navigation support throughout the site</li>
                <li>Visible focus indicators for all interactive elements</li>
                <li>High contrast colors for readability</li>
                <li>Semantic HTML with proper ARIA labels</li>
                <li>Screen reader friendly structure</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access</h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900">Q: What can admins do?</p>
              <div className="mt-2 space-y-2">
                <p>A: Add, edit, and remove businesses.</p>
                <p>A: Manage deals and coupons.</p>
                <p>A: Moderate reviews.</p>
                <p>A: Import/export business data via CSV.</p>
                <p>A: Reset demo data (with confirmation).</p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Q: How do I log in as admin?</p>
              <p className="mt-1">
                A: Username is <span className="font-semibold text-gray-900">&quot;admin&quot;</span>, and
                the password comes from the{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">ADMIN_PASSWORD</code> environment
                variable.
              </p>
            </div>
          </div>
        </section>

        <section className="card bg-primary-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Details</h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900">Q: What is Neighborly built with?</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Framework:</strong> Next.js 14+ with App Router and React</li>
                <li><strong>Language:</strong> TypeScript for type safety</li>
                <li><strong>Database:</strong> SQLite (local file) with Drizzle ORM</li>
                <li><strong>Styling:</strong> Tailwind CSS for responsive design</li>
                <li><strong>Validation:</strong> Zod for input validation</li>
                <li><strong>Offline:</strong> All features work without internet after setup</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
