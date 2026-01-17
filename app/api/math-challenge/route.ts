import { NextResponse } from 'next/server'
import { generateMathChallenge } from '@/lib/botguard'

export async function GET() {
  try {
    const challenge = generateMathChallenge()
    return NextResponse.json(challenge)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 })
  }
}
