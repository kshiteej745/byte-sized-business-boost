import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminLoginSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = adminLoginSchema.parse(body)

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (validated.username === 'admin' && validated.password === adminPassword) {
      const cookieStore = cookies()
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
