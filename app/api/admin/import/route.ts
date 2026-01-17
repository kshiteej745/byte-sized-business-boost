import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { businesses } from '@/lib/schema'
import { businessSchema } from '@/lib/validators'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()

    return new Promise<NextResponse>((resolve) => {
      Papa.parse(text, {
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
                console.warn('Skipping invalid row:', row, err)
              }
            }

            if (validBusinesses.length === 0) {
              resolve(NextResponse.json({ error: 'No valid businesses found in CSV' }, { status: 400 }))
              return
            }

            await db.insert(businesses).values(
              validBusinesses.map(b => ({
                ...b,
                createdAt: new Date(),
              }))
            )

            resolve(NextResponse.json({ success: true, imported: validBusinesses.length }))
          } catch (error) {
            console.error('Import error:', error)
            resolve(NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 }))
          }
        },
        error: (error) => {
          resolve(NextResponse.json({ error: 'Failed to parse CSV', details: error.message }, { status: 400 }))
        },
      })
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 })
  }
}
