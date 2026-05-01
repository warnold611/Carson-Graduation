'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Energy', 'Petrochemical',
  'Trades', 'Finance', 'Education', 'Military', 'Real Estate',
  'Transportation', 'Government', 'Other',
]

const COLLEGE_OPTIONS = ['Yes', 'No', 'Depends']

const QUICK_AMOUNTS = [500, 1000, 2500, 5000] // cents

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: 'var(--font-body)',
  },
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'rgba(13,7,7,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    padding: '0 20px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '40px 20px 80px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '28px 24px',
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    background: 'rgba(217,30,42,0.05)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: 15,
    outline: 'none',
  },
  textarea: {
    width: '100%',
    background: 'rgba(217,30,42,0.05)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: 15,
    outline: 'none',
    resize: 'vertical',
    minHeight: 88,
    fontFamily: 'var(--font-body)',
  },
  select: {
    width: '100%',
    background: 'rgba(217,30,42,0.05)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: 15,
    outline: 'none',
    cursor: 'pointer',
  },
  primaryBtn: {
    width: '100%',
    background: 'var(--red)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '15px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  secondaryBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px',
    color: 'var(--muted)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  toggle: (active) => ({
    flex: 1,
    padding: '10px 8px',
    borderRadius: 8,
    border: `1px solid ${active ? 'var(--red)' : 'var(--border)'}`,
    background: active ? 'rgba(217,30,42,0.12)' : 'transparent',
    color: active ? 'var(--red)' : 'var(--muted)',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'center',
  }),
  amountBtn: (active) => ({
    flex: 1,
    padding: '12px 8px',
    borderRadius: 10,
    border: `2px solid ${active ? 'var(--red)' : 'var(--border)'}`,
    background: active ? 'rgba(217,30,42,0.12)' : 'transparent',
    color: active ? 'var(--red)' : 'var(--text)',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'center',
  }),
  fieldGroup: { marginBottom: 18 },
  row: { display: 'flex', gap: 12 },
  charCount: { fontSize: 12, color: 'var(--muted)', textAlign: 'right', marginTop: 4 },
  error: {
    background: 'rgba(217,30,42,0.1)',
    border: '1px solid rgba(217,30,42,0.4)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 14,
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
}

// ─── Payment Form (inside Stripe Elements) ────────────────────────────────────
function PaymentForm({ amount, summary, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [ready, setReady] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    // Store summary for thank-you page
    try {
      sessionStorage.setItem('donationSummary', JSON.stringify({
        amount,
        ...summary,
      }))
    } catch {}

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you`,
      },
    })

    if (stripeError) {
      setError(stripeError.message)
      setProcessing(false)
    }
    // On success, Stripe redirects to /thank-you
  }

  const dollarsLabel = `$${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`

  return (
    <form onSubmit={handleSubmit}>
      {/* Summary */}
      {summary?.career && (
        <div style={{ ...S.card, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Your Career Submission
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{summary.career}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: summary.advice ? 10 : 0 }}>
            {summary.industry}
            {summary.collegeRequired ? ` · ${summary.collegeRequired} degree` : ''}
          </div>
          {summary.advice && (
            <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
              "{summary.advice.slice(0, 120)}{summary.advice.length > 120 ? '…' : ''}"
            </p>
          )}
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            ⏳ Your submission goes live after Wes reviews it.
          </p>
        </div>
      )}

      {/* Stripe Payment Element */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ opacity: ready ? 1 : 0.4, transition: 'opacity 0.3s' }}>
          <PaymentElement
            onReady={() => setReady(true)}
            options={{
              layout: 'tabs',
            }}
          />
        </div>
        {!ready && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 14 }}>
            Loading payment form…
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 14 }}>
        Payments processed securely by Stripe. Not tax deductible.
      </p>

      {error && <div style={S.error}>{error}</div>}

      <button
        type="submit"
        disabled={!stripe || !elements || processing || !ready}
        style={{
          ...S.primaryBtn,
          opacity: (!stripe || !elements || processing || !ready) ? 0.6 : 1,
          cursor: (!stripe || !elements || processing || !ready) ? 'not-allowed' : 'pointer',
          marginBottom: 10,
        }}
      >
        {processing ? 'Processing…' : `Complete Donation — ${dollarsLabel}`}
      </button>

      <button type="button" onClick={onBack} style={{ ...S.secondaryBtn, width: '100%' }}>
        ← Change Amount
      </button>
    </form>
  )
}

// ─── Main Donate Page ─────────────────────────────────────────────────────────
export default function DonatePage() {
  const [step, setStep] = useState(1) // 1 = form, 2 = amount+payment
  const [mode, setMode] = useState('story') // 'story' | 'only'
  const [isAnonymous, setIsAnonymous] = useState(false)

  // Donor info
  const [donorName, setDonorName] = useState('')
  const [donorCity, setDonorCity] = useState('')
  const [donorState, setDonorState] = useState('')

  // Career fields
  const [career, setCareer] = useState('')
  const [industry, setIndustry] = useState('')
  const [description, setDescription] = useState('')
  const [whatItTakes, setWhatItTakes] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [collegeRequired, setCollegeRequired] = useState('')
  const [timeline, setTimeline] = useState('')
  const [advice, setAdvice] = useState('')

  // Donation
  const [selectedAmount, setSelectedAmount] = useState(1000) // cents
  const [customAmount, setCustomAmount] = useState('')
  const [clientSecret, setClientSecret] = useState(null)
  const [creatingPI, setCreatingPI] = useState(false)
  const [piError, setPiError] = useState(null)
  const [formError, setFormError] = useState(null)

  const finalAmount = customAmount
    ? Math.round(parseFloat(customAmount.replace(/[^0-9.]/g, '')) * 100)
    : selectedAmount

  function validateStep1() {
    if (mode === 'story') {
      if (!career.trim()) return 'Career title is required.'
      if (!industry) return 'Please select an industry.'
      if (!description.trim()) return 'Please describe what you do.'
      if (!whatItTakes.trim()) return 'Please fill in what it takes.'
      if (!collegeRequired) return 'Please select whether college is required.'
      if (!timeline.trim()) return 'Please fill in the timeline.'
      if (!advice.trim()) return 'Please share a piece of advice for Carson.'
    }
    if (!isAnonymous) {
      if (!donorName.trim()) return 'Please enter your name (or check Anonymous).'
    }
    return null
  }

  function handleStep1Submit() {
    setFormError(null)
    const err = validateStep1()
    if (err) { setFormError(err); return }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleContinueToPayment() {
    setPiError(null)
    if (!finalAmount || finalAmount < 500) {
      setPiError('Minimum donation is $5.')
      return
    }

    setCreatingPI(true)
    try {
      const body = {
        amount: finalAmount,
        donorName: isAnonymous ? '' : donorName,
        donorCity: isAnonymous ? '' : donorCity,
        donorState: isAnonymous ? '' : donorState,
        isAnonymous,
        careerData: mode === 'story' ? {
          career, industry, description, whatItTakes,
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          collegeRequired, timeline, advice,
        } : null,
      }
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error) { setPiError(data.error); return }
      setClientSecret(data.clientSecret)
    } catch (err) {
      setPiError('Something went wrong. Please try again.')
    } finally {
      setCreatingPI(false)
    }
  }

  const stripeOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#D91E2A',
        colorBackground: '#1a0a0a',
        colorText: '#F5EDED',
        colorDanger: '#ff4444',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        borderRadius: '10px',
        spacingUnit: '4px',
      },
    },
  } : {}

  const careerSummary = mode === 'story' ? {
    career, industry, collegeRequired, advice,
  } : null

  function inputStyle(hasError) {
    return {
      ...S.input,
      borderColor: hasError ? 'rgba(217,30,42,0.6)' : 'var(--border)',
    }
  }

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={S.nav}>
        <Link href="/">
          <img src="/images/bcmark.png" alt="BC" style={{ height: 36, objectFit: 'contain' }} />
        </Link>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
          Step {step} of 2
        </div>
      </nav>

      <div style={S.container}>
        {/* Step indicator */}
        <div style={S.stepIndicator}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: step >= s ? 'var(--red)' : 'var(--surface)',
                border: `2px solid ${step >= s ? 'var(--red)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: step >= s ? '#fff' : 'var(--muted)',
              }}>
                {s}
              </div>
              <span style={{ fontSize: 13, color: step === s ? 'var(--text)' : 'var(--muted)', fontWeight: step === s ? 600 : 400 }}>
                {s === 1 ? 'Your Info' : 'Donation'}
              </span>
              {s < 2 && <div style={{ width: 24, height: 1, background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              marginBottom: 8,
            }}>
              Share Your Story
            </h1>
            <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 15 }}>
              Give Carson a real look at what's possible.
            </p>

            {/* Mode Toggle */}
            <div style={{ ...S.card }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button onClick={() => setMode('story')} style={S.toggle(mode === 'story')}>
                  🎯 Donate + Share Story
                </button>
                <button onClick={() => setMode('only')} style={S.toggle(mode === 'only')}>
                  💸 Donate Only
                </button>
              </div>

              {/* Anonymous */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: mode === 'story' ? 20 : 0 }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--red)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 15, color: 'var(--text)' }}>Keep me anonymous</span>
              </label>

              {/* Donor Info — shown when not anonymous */}
              {!isAnonymous && (
                <div style={{ marginTop: 16 }}>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Your Name</label>
                    <input
                      style={S.input}
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      placeholder="First name or full name"
                    />
                  </div>
                  <div style={{ ...S.row }}>
                    <div style={{ flex: 1 }}>
                      <label style={S.label}>City</label>
                      <input
                        style={S.input}
                        value={donorCity}
                        onChange={e => setDonorCity(e.target.value)}
                        placeholder="Houston"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={S.label}>State</label>
                      <input
                        style={S.input}
                        value={donorState}
                        onChange={e => setDonorState(e.target.value)}
                        placeholder="TX"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Career Fields */}
            {mode === 'story' && (
              <div style={S.card}>
                <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
                  Career Details
                </div>

                <div style={S.fieldGroup}>
                  <label style={S.label}>Career / Job Title *</label>
                  <input
                    style={S.input}
                    value={career}
                    onChange={e => setCareer(e.target.value)}
                    placeholder="e.g. Petroleum Engineer, Electrician, RN"
                    maxLength={100}
                  />
                </div>

                <div style={S.fieldGroup}>
                  <label style={S.label}>Industry *</label>
                  <select
                    style={S.select}
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                  >
                    <option value="">Select industry…</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div style={S.fieldGroup}>
                  <label style={S.label}>What You Do *</label>
                  <textarea
                    style={S.textarea}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your day-to-day work in plain language."
                    maxLength={490}
                  />
                  <div style={S.charCount}>{description.length}/490</div>
                </div>

                <div style={S.fieldGroup}>
                  <label style={S.label}>What It Takes to Get There *</label>
                  <textarea
                    style={S.textarea}
                    value={whatItTakes}
                    onChange={e => setWhatItTakes(e.target.value)}
                    placeholder="Certifications, training, personality, grind — be honest."
                    maxLength={490}
                  />
                  <div style={S.charCount}>{whatItTakes.length}/490</div>
                </div>

                <div style={{ ...S.row, marginBottom: 18 }}>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Salary Low (Annual)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--green)', fontWeight: 700 }}>$</span>
                      <input
                        style={{ ...S.input, paddingLeft: 28 }}
                        value={salaryMin}
                        onChange={e => setSalaryMin(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="45000"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Salary High (Annual)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--green)', fontWeight: 700 }}>$</span>
                      <input
                        style={{ ...S.input, paddingLeft: 28 }}
                        value={salaryMax}
                        onChange={e => setSalaryMax(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="85000"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ ...S.row, marginBottom: 18 }}>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>College Required? *</label>
                    <select
                      style={S.select}
                      value={collegeRequired}
                      onChange={e => setCollegeRequired(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {COLLEGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Timeline to Get Established *</label>
                    <input
                      style={S.input}
                      value={timeline}
                      onChange={e => setTimeline(e.target.value)}
                      placeholder="e.g. 2–4 years"
                      maxLength={80}
                    />
                  </div>
                </div>

                <div style={S.fieldGroup}>
                  <label style={S.label}>One Piece of Advice — Just for Carson *</label>
                  <textarea
                    style={{ ...S.textarea, minHeight: 100, borderColor: advice.length > 0 ? 'var(--border)' : 'var(--border)' }}
                    value={advice}
                    onChange={e => setAdvice(e.target.value)}
                    placeholder="What do you wish someone had told you at 18?"
                    maxLength={490}
                  />
                  <div style={S.charCount}>{advice.length}/490</div>
                </div>
              </div>
            )}

            {formError && <div style={S.error}>{formError}</div>}

            <button
              onClick={handleStep1Submit}
              style={S.primaryBtn}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-red)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
            >
              Continue to Donation →
            </button>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && !clientSecret && (
          <>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              marginBottom: 8,
            }}>
              Choose Your Amount
            </h1>
            <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 15 }}>
              Every dollar helps. Minimum is $5.
            </p>

            <div style={S.card}>
              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => { setSelectedAmount(amt); setCustomAmount('') }}
                    style={S.amountBtn(!customAmount && selectedAmount === amt)}
                    onMouseEnter={e => {
                      if (!(!customAmount && selectedAmount === amt)) {
                        e.currentTarget.style.borderColor = 'rgba(217,30,42,0.5)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!(!customAmount && selectedAmount === amt)) {
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }
                    }}
                  >
                    ${amt / 100}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)',
                  fontWeight: 700,
                  fontSize: 16,
                }}>$</span>
                <input
                  style={{
                    ...S.input,
                    paddingLeft: 32,
                    border: `2px solid ${customAmount ? 'var(--red)' : 'var(--border)'}`,
                    fontSize: 16,
                  }}
                  value={customAmount}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.]/g, '')
                    setCustomAmount(val)
                  }}
                  placeholder="Custom amount"
                  inputMode="decimal"
                />
              </div>

              {finalAmount > 0 && (
                <div style={{ marginTop: 12, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                  Total: <strong style={{ color: 'var(--text)', fontSize: 18 }}>
                    ${(finalAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              )}
            </div>

            {piError && <div style={S.error}>{piError}</div>}

            <button
              onClick={handleContinueToPayment}
              disabled={creatingPI || !finalAmount || finalAmount < 500}
              style={{
                ...S.primaryBtn,
                opacity: (creatingPI || !finalAmount || finalAmount < 500) ? 0.6 : 1,
                cursor: (creatingPI || !finalAmount || finalAmount < 500) ? 'not-allowed' : 'pointer',
                marginBottom: 10,
              }}
              onMouseEnter={e => { if (!creatingPI) e.currentTarget.style.background = 'var(--dark-red)' }}
              onMouseLeave={e => { if (!creatingPI) e.currentTarget.style.background = 'var(--red)' }}
            >
              {creatingPI ? 'Setting up payment…' : 'Continue to Payment →'}
            </button>

            <button
              onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{ ...S.secondaryBtn, width: '100%' }}
            >
              ← Back to Your Info
            </button>
          </>
        )}

        {/* ── STRIPE PAYMENT ── */}
        {step === 2 && clientSecret && (
          <>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              marginBottom: 8,
            }}>
              Complete Your Donation
            </h1>
            <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 15 }}>
              ${(finalAmount / 100).toLocaleString()} · {mode === 'story' ? 'Donation + Career Story' : 'Donation Only'}
            </p>

            <Elements stripe={stripePromise} options={stripeOptions}>
              <PaymentForm
                amount={finalAmount}
                summary={careerSummary}
                onBack={() => setClientSecret(null)}
              />
            </Elements>
          </>
        )}
      </div>
    </div>
  )
}
