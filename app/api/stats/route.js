import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const revalidate = 60

export async function GET() {
  try {
    const supabase = createServerClient()

    const [donorResult, storyResult, locationResult] = await Promise.all([
      supabase.from('donations').select('*', { count: 'exact', head: true }),
      supabase.from('career_submissions').select('id').eq('is_approved', true),
      supabase.from('donations').select('donor_city, donor_state').eq('is_anonymous', false),
    ])

    const cities = new Set(
      (locationResult.data || [])
        .filter(d => d.donor_city)
        .map(d => d.donor_city.trim().toLowerCase())
    )
    const states = new Set(
      (locationResult.data || [])
        .filter(d => d.donor_state)
        .map(d => d.donor_state.trim().toLowerCase())
    )

    return NextResponse.json({
      donorCount: donorResult.count || 0,
      storyCount: (storyResult.data || []).length,
      cityCount: cities.size,
      stateCount: states.size,
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
