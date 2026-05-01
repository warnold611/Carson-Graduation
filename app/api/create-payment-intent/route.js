import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const MAX_META_LEN = 490

function truncate(str) {
  if (!str) return ''
  return String(str).slice(0, MAX_META_LEN)
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { amount, donorName, donorCity, donorState, isAnonymous, careerData } = body

    if (!amount || amount < 500) {
      return NextResponse.json({ error: 'Minimum donation is $5.' }, { status: 400 })
    }

    const metadata = {
      donor_name: truncate(donorName),
      donor_city: truncate(donorCity),
      donor_state: truncate(donorState),
      is_anonymous: isAnonymous ? 'true' : 'false',
      has_career: careerData ? 'true' : 'false',
    }

    if (careerData) {
      Object.assign(metadata, {
        career: truncate(careerData.career),
        industry: truncate(careerData.industry),
        description: truncate(careerData.description),
        what_it_takes: truncate(careerData.whatItTakes),
        salary_min: careerData.salaryMin ? String(careerData.salaryMin) : '',
        salary_max: careerData.salaryMax ? String(careerData.salaryMax) : '',
        college_required: truncate(careerData.collegeRequired),
        timeline: truncate(careerData.timeline),
        advice: truncate(careerData.advice),
      })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      metadata,
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('create-payment-intent error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
