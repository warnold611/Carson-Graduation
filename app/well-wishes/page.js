'use client'

import { useState } from 'react'
import Link from 'next/link'

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' },
  nav: { position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,7,7,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  container: { maxWidth: 580, margin: '0 auto', padding: '48px 20px 80px' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px', marginBottom: 20 },
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 },
  input: { width: '100%', background: 'rgba(217,30,42,0.05)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none' },
  textarea: { width: '100%', background: 'rgba(217,30,42,0.05)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', minHeight: 120, lineHeight: 1.6 },
  primaryBtn: { width: '100%', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' },
  fieldGroup: { marginBottom: 18 },
  row: { display: 'flex', gap: 12 },
  error: { background: 'rgba(217,30,42,0.1)', border: '1px solid rgba(217,30,42,0.4)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#ff6b6b', marginBottom: 14 },
}

export default function WellWishesPage() {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) { setError('Please write a message for Carson.'); return }
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/well-wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, city, state, isAnonymous, message }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <Link href="/">
          <img src="/images/bcmark.png" alt="BC" style={{ height: 36, objectFit: 'contain' }} />
        </Link>
        <Link href="/donate">
          <button style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Donate
          </button>
        </Link>
      </nav>

      <div style={S.container}>
        {submitted ? (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🎓</div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 6vw, 2.6rem)', marginBottom: 14 }}>
              Sent with love.
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.65, maxWidth: 400, margin: '0 auto 32px' }}>
              Your message will appear on the Well Wishes wall once it's approved. Carson will see it.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
              <Link href="/">
                <button style={{ ...S.primaryBtn }} onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-red)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}>
                  ← Back to the site
                </button>
              </Link>
              <Link href="/donate">
                <button style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, padding: '13px', color: 'var(--muted)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                  Add your career story too
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                Class of 2026 · Bridge City
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', marginBottom: 12, lineHeight: 1.15 }}>
                Send Well Wishes
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.65 }}>
                Leave a message for Carson as he steps into the next chapter. No donation required — just your words.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={S.card}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--red)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 15 }}>Send anonymously</span>
                </label>

                {!isAnonymous && (
                  <>
                    <div style={S.fieldGroup}>
                      <label style={S.label}>Your Name</label>
                      <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="First name or full name" maxLength={100} />
                    </div>
                    <div style={{ ...S.row, marginBottom: 0 }}>
                      <div style={{ flex: 1 }}>
                        <label style={S.label}>City</label>
                        <input style={S.input} value={city} onChange={e => setCity(e.target.value)} placeholder="Beaumont" maxLength={80} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={S.label}>State</label>
                        <input style={S.input} value={state} onChange={e => setState(e.target.value)} placeholder="TX" maxLength={2} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={S.card}>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Your Message for Carson *</label>
                  <textarea
                    style={S.textarea}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Congratulations, Carson! Wishing you all the best as you start this new chapter…"
                    maxLength={500}
                  />
                  <div style={{ fontSize: 12, color: message.length > 450 ? 'var(--red)' : 'var(--muted)', textAlign: 'right', marginTop: 4 }}>
                    {message.length}/500
                  </div>
                </div>
              </div>

              {error && <div style={S.error}>{error}</div>}

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                style={{ ...S.primaryBtn, opacity: (submitting || !message.trim()) ? 0.6 : 1, cursor: (submitting || !message.trim()) ? 'not-allowed' : 'pointer' }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--dark-red)' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--red)' }}
              >
                {submitting ? 'Sending…' : 'Send My Well Wishes 🎓'}
              </button>

              <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 12 }}>
                Messages are reviewed before appearing on the wall.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
