import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const revalidate = 60

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('career_submissions')
      .select(`
        id,
        career,
        industry,
        description,
        what_it_takes,
        salary_min,
        salary_max,
        college_required,
        timeline,
        advice,
        created_at,
        donations (
          donor_name,
          donor_city,
          donor_state,
          is_anonymous
        )
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ submissions: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
