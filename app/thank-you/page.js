'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const [summary, setSummary] = useState(null)
  const [copied, setCopied] = useState(false)
  const redirectStatus = searchParams.get('redirect_status')
  const paymentIntentId = searchParams.get('payment_intent')

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('donationSummary')
      if (saved) {
        setSummary(JSON.parse(saved))
        sessionStorage.removeItem('donationSummary')
      }
    } catch {}
  }, [])

  async function handleShare() {
    const shareData = {
      title: 'I donated to help Carson Sauceda — Class of 2026!',
      text: "I just shared my career story to help shape what comes next for Carson Sauceda's future. Join me:",
      url: window.location.origin,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {}
    }
  }

  const dollarsLabel = summary?.amount
    ? `$${(summary.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : null

  const isSuccess = redirectStatus === 'succeeded'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px 80px',
      textAlign: 'center',
    }}>
      {/* Cardinal mascot */}
      <img
        src="/images/cardinal.png"
        alt="Bridge City Cardinal"
        style={{ height: 120, objectFit: 'contain', marginBottom: 24 }}
      />

      {/* Status */}
      {isSuccess ? (
        <>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--red)',
            marginBottom: 12,
          }}>
            Donation Confirmed
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 7vw, 3rem)',
            fontWeight: 700,
            marginBottom: 14,
            maxWidth: 480,
            lineHeight: 1.2,
          }}>
            You're part of his story.
          </h1>

          {dollarsLabel && (
            <div style={{
              background: 'rgba(217,30,42,0.08)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 20,
            }}>
              {dollarsLabel} <span style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 400 }}>donated</span>
            </div>
          )}

          <p style={{
            color: 'var(--muted)',
            fontSize: 16,
            maxWidth: 440,
            lineHeight: 1.65,
            marginBottom: 32,
          }}>
            Thank you for investing in Carson's future. Your generosity and your words will stay with him.
          </p>

          {/* Career submission notice */}
          {summary?.career && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '20px 24px',
              maxWidth: 460,
              width: '100%',
              marginBottom: 32,
              textAlign: 'left',
            }}>
              <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Your Submission
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{summary.career}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>{summary.industry}</div>
              {summary.advice && (
                <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  "{summary.advice.slice(0, 160)}{summary.advice.length > 160 ? '…' : ''}"
                </p>
              )}
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
                ⏳ Wes will review and approve your story before it goes live on the Career Wall.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.6rem, 6vw, 2.5rem)',
            marginBottom: 14,
          }}>
            Something went sideways.
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: 32, maxWidth: 400, lineHeight: 1.6 }}>
            Your payment may not have gone through. Try again or contact us if you believe this is an error.
          </p>
        </>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
        <button
          onClick={handleShare}
          style={{
            background: 'var(--red)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '14px',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-red)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
        >
          {copied ? '✓ Link Copied!' : '📣 Share the Campaign'}
        </button>

        <Link href="/" style={{ width: '100%' }}>
          <button style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '13px',
            color: 'var(--muted)',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
          }}>
            ← View the Career Wall
          </button>
        </Link>

        {!isSuccess && (
          <Link href="/donate" style={{ width: '100%' }}>
            <button style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '13px',
              color: 'var(--text)',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
            }}>
              Try Again
            </button>
          </Link>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, color: 'var(--muted)', fontSize: 13 }}>
        <img src="/images/bcmark.png" alt="BC" style={{ height: 20, objectFit: 'contain', margin: '0 auto 8px' }} />
        Bridge City Cardinals · Class of 2026
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
        Loading…
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
