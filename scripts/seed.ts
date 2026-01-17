import { db } from '../lib/db'
import { businesses, deals, reviews } from '../lib/schema'
import { readFileSync } from 'fs'
import { join } from 'path'
import Papa from 'papaparse'
import { businessSchema } from '../lib/validators'

async function seed() {
  try {
    console.log('Starting seed process...')

    // Get all existing businesses
    const existingBusinesses = await db.select().from(businesses)
    let businessList = existingBusinesses

    // If no businesses exist, read from CSV and insert
    if (existingBusinesses.length === 0) {
      console.log('No businesses found. Loading from CSV...')
      const csvPath = join(process.cwd(), 'seed', 'richmond_sample.csv')
      const csvContent = readFileSync(csvPath, 'utf-8')

      return new Promise<void>((resolve, reject) => {
        Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              const rows = results.data as any[]
              const validBusinesses = []

              for (const row of rows) {
                try {
                  const validated = businessSchema.parse({
                    name: row.name || row.Name,
                    category: row.category || row.Category,
                    neighborhood: row.neighborhood || row.Neighborhood,
                    address: row.address || row.Address,
                    phone: row.phone || row.Phone || undefined,
                    website: row.website || row.Website || undefined,
                    description: row.description || row.Description || undefined,
                    tagsCsv: row.tags_csv || row.tagsCsv || row['tags_csv'] || undefined,
                  })
                  validBusinesses.push(validated)
                } catch (err) {
                  console.warn('Skipping invalid row:', row)
                }
              }

              if (validBusinesses.length === 0) {
                console.error('No valid businesses found in CSV')
                reject(new Error('No valid businesses found'))
                return
              }

              // Insert businesses
              const inserted = await db.insert(businesses).values(
                validBusinesses.map(b => ({
                  ...b,
                  createdAt: new Date(),
                }))
              ).returning()

              console.log(`Inserted ${inserted.length} businesses`)
              businessList = inserted

              // Continue with deals and reviews...
              await addDealsAndReviews(businessList)
              resolve()
            } catch (error) {
              console.error('Error processing CSV:', error)
              reject(error)
            }
          },
          error: (error) => {
            console.error('Error parsing CSV:', error)
            reject(error)
          },
        })
      })
    } else {
      console.log(`Found ${existingBusinesses.length} existing businesses. Adding reviews and deals...`)
      // Add deals and reviews to existing businesses
      await addDealsAndReviews(businessList)
    }
  } catch (error) {
    console.error('Seed error:', error)
    throw error
  }
}

async function addDealsAndReviews(inserted: typeof businesses.$inferSelect[]) {
  try {

    // Check if deals already exist
    const existingDeals = await db.select().from(deals).limit(1)
    if (existingDeals.length === 0) {
      // Add sample deals distributed across businesses
      // Deal templates that rotate across different business types
      const dealTemplates = [
        { title: 'Grand Opening Special', description: '20% off your entire purchase this month!', code: 'WELCOME20', days: 30 },
        { title: 'Weekend Warrior', description: 'Buy one get one 50% off all weekend long', code: 'WEEKEND50', days: 14 },
        { title: 'Free Shipping', description: 'Free delivery on orders over $25', code: 'FREESHIP25', days: 7 },
        { title: 'Student Discount', description: '15% off with valid student ID', code: 'STUDENT15', days: 60 },
        { title: 'Early Bird Special', description: '20% off orders before 11 AM', code: 'EARLY20', days: 21 },
        { title: 'Happy Hour Deal', description: '50% off appetizers 4-6 PM weekdays', code: 'HAPPYHOUR', days: 45 },
        { title: 'Neighborhood Discount', description: '10% off for Richmond locals', code: 'LOCAL10', days: 90 },
        { title: 'Lunch Special', description: 'Combo meals 15% off 11 AM - 2 PM', code: 'LUNCH15', days: 28 },
        { title: 'First Time Visitor', description: '25% off your first visit', code: 'FIRST25', days: 60 },
        { title: 'Refer a Friend', description: 'Get 20% off when you bring a friend', code: 'FRIEND20', days: 45 },
        { title: 'Birthday Special', description: 'Free dessert with any meal on your birthday', code: 'BIRTHDAY', days: 365 },
        { title: 'Flash Sale', description: '30% off today only', code: 'FLASH30', days: 1 },
        { title: 'Loyalty Reward', description: '10% off for returning customers', code: 'LOYAL10', days: 30 },
        { title: 'Family Pack', description: 'Buy 3 get 1 free on family meals', code: 'FAMILY4', days: 35 },
        { title: 'Takeout Special', description: '15% off all takeout orders', code: 'TAKEOUT15', days: 21 },
      ]

      const sampleDeals = []
      
      // Distribute deals across businesses - give each business 1-2 deals
      inserted.forEach((business, idx) => {
        const numDeals = idx % 3 === 0 ? 2 : 1 // Every 3rd business gets 2 deals
        const templates = dealTemplates.slice((idx * 2) % dealTemplates.length)
        
        for (let i = 0; i < numDeals && i < templates.length; i++) {
          const template = templates[i]
          sampleDeals.push({
            businessId: business.id,
            title: template.title,
            description: template.description,
            couponCode: template.code,
            expiresOn: new Date(Date.now() + template.days * 24 * 60 * 60 * 1000),
            isActive: true,
          })
        }
      })

      if (sampleDeals.length > 0) {
        await db.insert(deals).values(sampleDeals)
        console.log(`Inserted ${sampleDeals.length} sample deals across ${inserted.length} businesses`)
      }
    } else {
      console.log('Deals already exist. Skipping...')
    }

    // Check if reviews already exist
    const existingReviews = await db.select().from(reviews).limit(1)
    if (existingReviews.length === 0) {
      // Add sample reviews for businesses
      const sampleReviews = []

      // Review templates
            const reviewTemplates = [
              {
                ratings: [5, 5, 4, 5, 4],
                titles: [
                  'Amazing spot!',
                  'Really enjoyed this place',
                  'Great food and service',
                  'Perfect for families',
                  'Will definitely come back',
                ],
                bodies: [
                  'This place exceeded my expectations. The food was fantastic and the staff was super friendly. Highly recommend!',
                  'Had a great time here with friends. Good atmosphere and reasonable prices. The service was quick too.',
                  'Solid experience overall. Food was good quality, portions were generous. The location is convenient.',
                  'Brought the whole family and everyone loved it. Kid-friendly options available and staff was accommodating.',
                  'Really enjoyed my visit. The ambiance is nice and the prices are fair. Looking forward to my next visit!',
                ],
                displayNames: ['Sarah M.', 'Mike T.', 'Jessica K.', 'David R.', 'Emily P.'],
              },
              {
                ratings: [4, 5, 5, 4, 5],
                titles: [
                  'Great local find',
                  'Love this place!',
                  'Excellent service',
                  'Good value for money',
                  'Highly recommend',
                ],
                bodies: [
                  'Found this place through Neighborly and so glad I did! Really nice atmosphere and good food. Will be back soon.',
                  'This has become one of my regular spots. Always consistent quality and friendly staff. Great addition to the neighborhood!',
                  'The service here is outstanding. Staff really knows their stuff and goes above and beyond. Food quality is excellent too.',
                  'Good bang for your buck. Prices are reasonable and portions are generous. Quality is solid across the board.',
                  'Can\'t say enough good things about this place. Great food, great service, great vibes. Definitely check it out!',
                ],
                displayNames: ['Chris L.', 'Amanda B.', 'Ryan H.', 'Lisa W.', 'Tom S.'],
              },
              {
                ratings: [5, 4, 5, 4, 4],
                titles: [
                  'Perfect for date night',
                  'Cozy atmosphere',
                  'Great selection',
                  'Affordable and tasty',
                  'Neighborhood gem',
                ],
                bodies: [
                  'Took my partner here for date night and it was perfect. Romantic atmosphere, delicious food, and great wine selection.',
                  'Love the cozy vibe here. Perfect place to unwind after work. The coffee is excellent and the staff is welcoming.',
                  'They have such a great selection here. Something for everyone. Quality is consistent and prices are fair.',
                  'Really appreciate how affordable this place is without sacrificing quality. Great food and good portions for the price.',
                  'This is a true neighborhood gem. Local ownership shows in the care they put into everything. Support local businesses!',
                ],
                displayNames: ['Karen D.', 'James F.', 'Maria G.', 'Robert N.', 'Patricia Q.'],
              },
            ]

            // Add 3-7 reviews per business
            inserted.forEach((business, idx) => {
              const template = reviewTemplates[idx % reviewTemplates.length]
              const numReviews = 3 + Math.floor(Math.random() * 5) // 3-7 reviews per business

              for (let i = 0; i < numReviews; i++) {
                const ratingIdx = i % template.ratings.length
                const daysAgo = Math.floor(Math.random() * 90) // Reviews from last 90 days

                sampleReviews.push({
                  businessId: business.id,
                  rating: template.ratings[ratingIdx],
                  title: template.titles[ratingIdx],
                  body: template.bodies[ratingIdx],
                  displayName: template.displayNames[ratingIdx],
                  createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
                })
              }
            })

      if (sampleReviews.length > 0) {
        await db.insert(reviews).values(sampleReviews)
        console.log(`Inserted ${sampleReviews.length} sample reviews`)
      }
    } else {
      console.log('Reviews already exist. Skipping...')
    }

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Error adding deals and reviews:', error)
    throw error
  }
}

seed()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
