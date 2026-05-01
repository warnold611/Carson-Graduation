import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const revalidate = 60

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('donations')
      .select('id, donor_name, donor_city, donor_state, is_anonymous, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ donors: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
