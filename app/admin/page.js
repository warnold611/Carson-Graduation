'use client'

import { useState } from 'react'
import Link from 'next/link'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatMoney(n) {
  if (!n) return '—'
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' },
  container: { maxWidth: 860, margin: '0 auto', padding: '40px 20px 80px' },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '20px',
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'block',
    marginBottom: 3,
  },
  value: { fontSize: 14, color: 'var(--text)', lineHeight: 1.5 },
  input: {
    width: '100%',
    background: 'rgba(217,30,42,0.05)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
  },
  approveBtn: {
    background: 'rgba(76,175,134,0.15)',
    border: '1px solid rgba(76,175,134,0.4)',
    color: '#4CAF86',
    borderRadius: 8,
    padding: '8px 18px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },
  rejectBtn: {
    background: 'rgba(217,30,42,0.1)',
    border: '1px solid rgba(217,30,42,0.3)',
    color: 'var(--red)',
    borderRadius: 8,
    padding: '8px 18px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },
  primaryBtn: {
    background: 'var(--red)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '13px 28px',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    width: '100%',
  },
  field: { marginBottom: 10 },
}

function SubmissionCard({ sub, password, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const d = sub.donations

  async function handleAction(approved) {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ id: sub.id, approved }),
      })
      const data = await res.json()
      if (data.error) { setErr(data.error); return }
      onUpdate(sub.id)
    } catch {
      setErr('Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.card}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 3 }}>{sub.career}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            {sub.industry}
            {sub.college_required ? ` · College: ${sub.college_required}` : ''}
            {sub.timeline ? ` · ${sub.timeline}` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{formatDate(sub.created_at)}</div>
          {d && (
            <div style={{ fontSize: 13, color: '#4CAF86', fontWeight: 700 }}>
              {formatMoney(d.amount)} donated
            </div>
          )}
        </div>
      </div>

      {/* Donor info */}
      {d && (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={S.field}>
            <span style={S.label}>Donor</span>
            <span style={S.value}>
              {d.is_anonymous ? '🎗 Anonymous' : d.donor_name || '—'}
            </span>
          </div>
          {!d.is_anonymous && (
            <div style={S.field}>
              <span style={S.label}>Location</span>
              <span style={S.value}>{[d.donor_city, d.donor_state].filter(Boolean).join(', ') || '—'}</span>
            </div>
          )}
          <div style={S.field}>
            <span style={S.label}>Stripe ID</span>
            <span style={{ ...S.value, fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>
              {d.stripe_payment_id || '—'}
            </span>
          </div>
        </div>
      )}

      {/* Career fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: 14 }}>
        {[
          ['Salary Range', sub.salary_min || sub.salary_max
            ? `${sub.salary_min ? '$' + Number(sub.salary_min).toLocaleString() : '?'} – ${sub.salary_max ? '$' + Number(sub.salary_max).toLocaleString() : '?'}/yr`
            : '—'],
        ].map(([k, v]) => (
          <div key={k} style={S.field}>
            <span style={S.label}>{k}</span>
            <span style={{ ...S.value, color: '#4CAF86', fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>

      {sub.description && (
        <div style={{ ...S.field, marginBottom: 12 }}>
          <span style={S.label}>What They Do</span>
          <p style={{ ...S.value, whiteSpace: 'pre-wrap' }}>{sub.description}</p>
        </div>
      )}

      {sub.what_it_takes && (
        <div style={{ ...S.field, marginBottom: 12 }}>
          <span style={S.label}>What It Takes</span>
          <p style={{ ...S.value, whiteSpace: 'pre-wrap' }}>{sub.what_it_takes}</p>
        </div>
      )}

      {sub.advice && (
        <div style={{
          borderLeft: '3px solid var(--red)',
          paddingLeft: 12,
          marginBottom: 16,
        }}>
          <span style={S.label}>Advice for Carson</span>
          <p style={{ ...S.value, fontStyle: 'italic', color: 'var(--muted)' }}>"{sub.advice}"</p>
        </div>
      )}

      {err && (
        <div style={{ background: 'rgba(217,30,42,0.1)', border: '1px solid rgba(217,30,42,0.4)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#ff6b6b', marginBottom: 12 }}>
          {err}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => handleAction(true)}
          disabled={loading}
          style={{ ...S.approveBtn, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '…' : '✓ Approve'}
        </button>
        <button
          onClick={() => handleAction(false)}
          disabled={loading}
          style={{ ...S.rejectBtn, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '…' : '✕ Reject'}
        </button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pending', {
        headers: { 'x-admin-password': password },
      })
      const data = await res.json()
      if (res.status === 401) { setError('Wrong password.'); return }
      if (data.error) { setError(data.error); return }
      setSubmissions(data.submissions || [])
      setAuthed(true)
    } catch {
      setError('Request failed. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/pending', {
        headers: { 'x-admin-password': password },
      })
      const data = await res.json()
      if (!data.error) setSubmissions(data.submissions || [])
    } catch {}
    finally { setRefreshing(false) }
  }

  function handleUpdate(id) {
    setSubmissions(prev => prev.filter(s => s.id !== id))
  }

  if (!authed) {
    return (
      <div style={{
        ...S.page,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/images/cardinal.png" alt="BC" style={{ height: 64, objectFit: 'contain', margin: '0 auto 16px' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginBottom: 6 }}>Admin Panel</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>For Carson · Pending Submissions</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ ...S.label, marginBottom: 8 }}>Admin Password</label>
              <input
                type="password"
                style={S.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password…"
                autoFocus
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(217,30,42,0.1)',
                border: '1px solid rgba(217,30,42,0.4)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 14,
                color: '#ff6b6b',
                marginBottom: 14,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                ...S.primaryBtn,
                opacity: (loading || !password) ? 0.6 : 1,
                cursor: (loading || !password) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Checking…' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/" style={{ color: 'var(--muted)', fontSize: 13 }}>← Back to site</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(13,7,7,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          Admin · Pending ({submissions.length})
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '7px 16px',
              color: 'var(--muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link href="/" style={{ color: 'var(--muted)', fontSize: 13 }}>← Site</Link>
        </div>
      </nav>

      <div style={S.container}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginBottom: 6 }}>
          Pending Career Submissions
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
          Approve to publish to the Career Wall. Reject to dismiss (submission stays in DB).
        </p>

        {submissions.length === 0 ? (
          <div style={{
            ...S.card,
            textAlign: 'center',
            padding: '48px 24px',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-heading)', marginBottom: 6 }}>All caught up!</div>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>No pending submissions right now.</p>
          </div>
        ) : (
          submissions.map(sub => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              password={password}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </div>
  )
}
