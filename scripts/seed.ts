import { db } from '../lib/db'
import { businesses, deals } from '../lib/schema'
import { readFileSync } from 'fs'
import { join } from 'path'
import Papa from 'papaparse'
import { businessSchema } from '../lib/validators'

async function seed() {
  try {
    console.log('Starting seed process...')

    // Check if businesses already exist
    const existing = await db.select().from(businesses).limit(1)
    if (existing.length > 0) {
      console.log('Database already has data. Skipping seed.')
      return
    }

    // Read CSV file
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

            // Add some sample deals
            if (inserted.length > 0) {
              const sampleDeals = [
                {
                  businessId: inserted[0].id,
                  title: 'Grand Opening Special',
                  description: '20% off your first purchase!',
                  couponCode: 'WELCOME20',
                  expiresOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                  isActive: true,
                },
                {
                  businessId: inserted[1]?.id || inserted[0].id,
                  title: 'Weekend Special',
                  description: 'Buy one get one 50% off',
                  couponCode: 'WEEKEND50',
                  expiresOn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                  isActive: true,
                },
                {
                  businessId: inserted[2]?.id || inserted[0].id,
                  title: 'Limited Time Offer',
                  description: 'Free delivery on orders over $25',
                  couponCode: 'FREESHIP25',
                  expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days - expiring soon
                  isActive: true,
                },
              ]

              await db.insert(deals).values(sampleDeals)
              console.log(`Inserted ${sampleDeals.length} sample deals`)
            }

            console.log('Seed completed successfully!')
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
  } catch (error) {
    console.error('Seed error:', error)
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
