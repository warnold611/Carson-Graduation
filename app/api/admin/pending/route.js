import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('career_submissions')
      .select(`
        *,
        donations (
          donor_name,
          donor_city,
          donor_state,
          is_anonymous,
          amount,
          stripe_payment_id,
          created_at
        )
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ submissions: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
