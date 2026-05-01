import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const revalidate = 60

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('well_wishes')
      .select('id, name, city, state, is_anonymous, message, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ wishes: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { name, city, state, isAnonymous, message } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    if (message.length > 500) return NextResponse.json({ error: 'Message must be 500 characters or less.' }, { status: 400 })
    const supabase = createServerClient()
    const { error } = await supabase.from('well_wishes').insert({
      name: isAnonymous ? null : (name?.trim() || null),
      city: isAnonymous ? null : (city?.trim() || null),
      state: isAnonymous ? null : (state?.trim() || null),
      is_anonymous: !!isAnonymous,
      message: message.trim(),
      is_approved: false,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
