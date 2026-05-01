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
      .from('well_wishes')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ wishes: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id, approved } = await req.json()
    if (!id || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const supabase = createServerClient()
    const { error } = await supabase
      .from('well_wishes')
      .update({ is_approved: approved })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
