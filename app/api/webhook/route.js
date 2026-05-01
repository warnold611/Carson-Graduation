import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const { metadata } = pi

    const supabase = createServerClient()

    // Insert donation — stripe_payment_id is UNIQUE so duplicate webhooks are safe
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        stripe_payment_id: pi.id,
        amount: pi.amount / 100,
        donor_name: metadata.donor_name || null,
        donor_city: metadata.donor_city || null,
        donor_state: metadata.donor_state || null,
        is_anonymous: metadata.is_anonymous === 'true',
      })
      .select('id')
      .single()

    if (donationError) {
      // Unique violation means this PI was already processed — safe to ignore
      if (donationError.code === '23505') {
        return NextResponse.json({ received: true, note: 'duplicate' })
      }
      console.error('Donation insert error:', donationError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Insert career submission if career data is present
    if (metadata.has_career === 'true' && metadata.career) {
      const { error: careerError } = await supabase
        .from('career_submissions')
        .insert({
          donation_id: donation.id,
          career: metadata.career || null,
          industry: metadata.industry || null,
          description: metadata.description || null,
          what_it_takes: metadata.what_it_takes || null,
          salary_min: metadata.salary_min ? parseFloat(metadata.salary_min) : null,
          salary_max: metadata.salary_max ? parseFloat(metadata.salary_max) : null,
          college_required: metadata.college_required || null,
          timeline: metadata.timeline || null,
          advice: metadata.advice || null,
          is_approved: false,
        })

      if (careerError) {
        console.error('Career submission insert error:', careerError)
        // Don't fail the webhook — donation was recorded
      }
    }
  }

  return NextResponse.json({ received: true })
}
