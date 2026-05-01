'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatMoney(n) {
  if (!n) return '—'
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
}

async function compressImage(file, maxWidth = 800, quality = 0.82) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' },
  container: { maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', marginBottom: 16 },
  sectionTitle: { fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' },
  label: { fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 },
  input: { width: '100%', background: 'rgba(217,30,42,0.05)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' },
  textarea: { width: '100%', background: 'rgba(217,30,42,0.05)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', minHeight: 160, lineHeight: 1.6 },
  saveBtn: { background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  approveBtn: { background: 'rgba(76,175,134,0.15)', border: '1px solid rgba(76,175,134,0.4)', color: '#4CAF86', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  rejectBtn: { background: 'rgba(217,30,42,0.1)', border: '1px solid rgba(217,30,42,0.3)', color: 'var(--red)', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  primaryBtn: { background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', width: '100%' },
  tab: (active) => ({ padding: '10px 20px', borderRadius: 8, border: 'none', background: active ? 'var(--red)' : 'var(--surface)', color: active ? '#fff' : 'var(--muted)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }),
  fieldGroup: { marginBottom: 18 },
  errBox: { background: 'rgba(217,30,42,0.1)', border: '1px solid rgba(217,30,42,0.4)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ff6b6b', marginTop: 10 },
  successBox: { background: 'rgba(76,175,134,0.1)', border: '1px solid rgba(76,175,134,0.4)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#4CAF86', marginTop: 10 },
}

// ─── Submission Card ──────────────────────────────────────────────────────────
function SubmissionCard({ sub, password, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const d = sub.donations

  async function handleAction(approved) {
    setLoading(true); setErr(null)
    try {
      const res = await fetch('/api/admin/approve', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ id: sub.id, approved }) })
      const data = await res.json()
      if (data.error) { setErr(data.error); return }
      onUpdate(sub.id)
    } catch { setErr('Request failed.') }
    finally { setLoading(false) }
  }

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 3 }}>{sub.career}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{sub.industry}{sub.college_required ? ` · College: ${sub.college_required}` : ''}{sub.timeline ? ` · ${sub.timeline}` : ''}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{formatDate(sub.created_at)}</div>
          {d && <div style={{ fontSize: 13, color: '#4CAF86', fontWeight: 700 }}>{formatMoney(d.amount)} donated</div>}
        </div>
      </div>

      {d && (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
          <div><span style={S.label}>Donor</span><span style={{ fontSize: 14 }}>{d.is_anonymous ? '🎗 Anonymous' : d.donor_name || '—'}</span></div>
          {!d.is_anonymous && <div><span style={S.label}>Location</span><span style={{ fontSize: 14 }}>{[d.donor_city, d.donor_state].filter(Boolean).join(', ') || '—'}</span></div>}
          <div><span style={S.label}>Stripe ID</span><span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--muted)' }}>{d.stripe_payment_id || '—'}</span></div>
        </div>
      )}

      {sub.salary_min || sub.salary_max ? (
        <div style={{ marginBottom: 12 }}>
          <span style={S.label}>Salary Range</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#4CAF86' }}>
            {sub.salary_min ? '$' + Number(sub.salary_min).toLocaleString() : '?'} – {sub.salary_max ? '$' + Number(sub.salary_max).toLocaleString() : '?'}/yr
          </span>
        </div>
      ) : null}

      {sub.description && <div style={{ marginBottom: 12 }}><span style={S.label}>What They Do</span><p style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{sub.description}</p></div>}
      {sub.what_it_takes && <div style={{ marginBottom: 12 }}><span style={S.label}>What It Takes</span><p style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{sub.what_it_takes}</p></div>}
      {sub.advice && (
        <div style={{ borderLeft: '3px solid var(--red)', paddingLeft: 12, marginBottom: 16 }}>
          <span style={S.label}>Advice for Carson</span>
          <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.55 }}>"{sub.advice}"</p>
        </div>
      )}

      {err && <div style={S.errBox}>{err}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={() => handleAction(true)} disabled={loading} style={{ ...S.approveBtn, opacity: loading ? 0.6 : 1 }}>{loading ? '…' : '✓ Approve'}</button>
        <button onClick={() => handleAction(false)} disabled={loading} style={{ ...S.rejectBtn, opacity: loading ? 0.6 : 1 }}>{loading ? '…' : '✕ Reject'}</button>
      </div>
    </div>
  )
}

// ─── Wish Card ────────────────────────────────────────────────────────────────
function WishCard({ wish, from, password, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  async function handleAction(approved) {
    setLoading(true); setErr(null)
    try {
      const res = await fetch('/api/admin/well-wishes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ id: wish.id, approved }) })
      const data = await res.json()
      if (data.error) { setErr(data.error); return }
      onUpdate(wish.id)
    } catch { setErr('Request failed.') }
    finally { setLoading(false) }
  }

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>— {from}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(wish.created_at)}</div>
      </div>
      <p style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 16 }}>"{wish.message}"</p>
      {err && <div style={S.errBox}>{err}</div>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => handleAction(true)} disabled={loading} style={{ ...S.approveBtn, opacity: loading ? 0.6 : 1 }}>{loading ? '…' : '✓ Approve'}</button>
        <button onClick={() => handleAction(false)} disabled={loading} style={{ ...S.rejectBtn, opacity: loading ? 0.6 : 1 }}>{loading ? '…' : '✕ Reject'}</button>
      </div>
    </div>
  )
}

// ─── Site Settings Panel ──────────────────────────────────────────────────────
function SettingsPanel({ password }) {
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [dadsNote, setDadsNote] = useState('')
  const [donorGoal, setDonorGoal] = useState('')
  const [siteSubtitle, setSiteSubtitle] = useState('')
  const [aboutBio, setAboutBio] = useState('')
  const [aboutQuote, setAboutQuote] = useState('')
  const [aboutInterests, setAboutInterests] = useState('')
  const [graduationDate, setGraduationDate] = useState('')
  const [saving, setSaving] = useState({})
  const [results, setResults] = useState({})
  const photoInputRef = useRef(null)

  // Load current settings
  useState(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.carson_photo) setPhotoPreview(d.carson_photo)
      if (d.dads_note) setDadsNote(d.dads_note)
      if (d.donor_goal) setDonorGoal(d.donor_goal)
      if (d.site_subtitle) setSiteSubtitle(d.site_subtitle)
      if (d.about_bio) setAboutBio(d.about_bio)
      if (d.about_quote) setAboutQuote(d.about_quote)
      if (d.about_interests) setAboutInterests(d.about_interests)
      if (d.graduation_date) setGraduationDate(d.graduation_date)
    })
  }, [])

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPhoto(compressed)
    setPhotoPreview(compressed)
  }

  async function saveSetting(key, value) {
    setSaving(p => ({ ...p, [key]: true }))
    setResults(p => ({ ...p, [key]: null }))
    try {
      const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ key, value }) })
      const data = await res.json()
      setResults(p => ({ ...p, [key]: data.error ? { err: data.error } : { ok: 'Saved!' } }))
    } catch {
      setResults(p => ({ ...p, [key]: { err: 'Request failed.' } }))
    } finally {
      setSaving(p => ({ ...p, [key]: false }))
    }
  }

  return (
    <div>
      {/* Carson's Photo */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Carson's Photo</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '3px solid var(--red)', overflow: 'hidden', background: 'var(--surface)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {photoPreview
              ? <img src={photoPreview} alt="Carson" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 8 }}>No photo set</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.55 }}>
              This photo appears on the homepage for <strong style={{ color: 'var(--text)' }}>all visitors</strong>. Only you can change it here. Recommended: square crop, at least 400×400px.
            </p>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => photoInputRef.current?.click()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 18px', color: 'var(--text)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                {photoPreview ? '📷 Change Photo' : '📷 Upload Photo'}
              </button>
              {photo && (
                <button onClick={() => saveSetting('carson_photo', photo)} disabled={saving.carson_photo} style={{ ...S.saveBtn, opacity: saving.carson_photo ? 0.6 : 1 }}>
                  {saving.carson_photo ? 'Saving…' : 'Save Photo'}
                </button>
              )}
              {photoPreview && (
                <button
                  onClick={async () => { if (!confirm('Remove the photo?')) return; setPhotoPreview(null); setPhoto(null); await saveSetting('carson_photo', null) }}
                  style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 18px', color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}
                >
                  Remove
                </button>
              )}
            </div>
            {results.carson_photo?.ok && <div style={S.successBox}>{results.carson_photo.ok}</div>}
            {results.carson_photo?.err && <div style={S.errBox}>{results.carson_photo.err}</div>}
          </div>
        </div>
      </div>

      {/* Dad's Note */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Dad's Note</div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Message (supports paragraph breaks)</label>
          <textarea style={S.textarea} value={dadsNote} onChange={e => setDadsNote(e.target.value)} />
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{dadsNote.length} chars</div>
        </div>
        <button onClick={() => saveSetting('dads_note', dadsNote)} disabled={saving.dads_note} style={{ ...S.saveBtn, opacity: saving.dads_note ? 0.6 : 1 }}>
          {saving.dads_note ? 'Saving…' : 'Save Note'}
        </button>
        {results.dads_note?.ok && <div style={S.successBox}>{results.dads_note.ok}</div>}
        {results.dads_note?.err && <div style={S.errBox}>{results.dads_note.err}</div>}
      </div>

      {/* Site Subtitle */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Hero Subtitle</div>
        <div style={S.fieldGroup}>
          <label style={S.label}>Text shown under the headline on the homepage</label>
          <textarea style={{ ...S.textarea, minHeight: 80 }} value={siteSubtitle} onChange={e => setSiteSubtitle(e.target.value)} />
        </div>
        <button onClick={() => saveSetting('site_subtitle', siteSubtitle)} disabled={saving.site_subtitle} style={{ ...S.saveBtn, opacity: saving.site_subtitle ? 0.6 : 1 }}>
          {saving.site_subtitle ? 'Saving…' : 'Save Subtitle'}
        </button>
        {results.site_subtitle?.ok && <div style={S.successBox}>{results.site_subtitle.ok}</div>}
        {results.site_subtitle?.err && <div style={S.errBox}>{results.site_subtitle.err}</div>}
      </div>

      {/* Donor Goal */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Donor Goal</div>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.55 }}>
          Sets the target on the progress bar ("X of Y donors"). Dollar amounts are never shown publicly.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            style={{ ...S.input, maxWidth: 140 }}
            type="number"
            min="1"
            value={donorGoal}
            onChange={e => setDonorGoal(e.target.value)}
            placeholder="50"
          />
          <button onClick={() => saveSetting('donor_goal', donorGoal)} disabled={saving.donor_goal} style={{ ...S.saveBtn, opacity: saving.donor_goal ? 0.6 : 1 }}>
            {saving.donor_goal ? 'Saving…' : 'Save Goal'}
          </button>
        </div>
        {results.donor_goal?.ok && <div style={S.successBox}>{results.donor_goal.ok}</div>}
        {results.donor_goal?.err && <div style={S.errBox}>{results.donor_goal.err}</div>}
      </div>

      {/* About Carson */}
      <div style={S.card}>
        <div style={S.sectionTitle}>About Carson</div>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.55 }}>
          Shown on the <strong style={{ color: 'var(--text)' }}>/about</strong> page. Helps strangers connect with Carson before donating.
        </p>

        <div style={S.fieldGroup}>
          <label style={S.label}>Bio (supports paragraph breaks)</label>
          <textarea style={S.textarea} value={aboutBio} onChange={e => setAboutBio(e.target.value)} placeholder="Write a few paragraphs about Carson…" />
          <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>{aboutBio.length} chars</div>
        </div>
        <button onClick={() => saveSetting('about_bio', aboutBio)} disabled={saving.about_bio} style={{ ...S.saveBtn, opacity: saving.about_bio ? 0.6 : 1, marginBottom: 6 }}>
          {saving.about_bio ? 'Saving…' : 'Save Bio'}
        </button>
        {results.about_bio?.ok && <div style={S.successBox}>{results.about_bio.ok}</div>}
        {results.about_bio?.err && <div style={S.errBox}>{results.about_bio.err}</div>}

        <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

        <div style={S.fieldGroup}>
          <label style={S.label}>Quote from Carson <span style={{ color: 'var(--muted)', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
          <textarea style={{ ...S.textarea, minHeight: 72 }} value={aboutQuote} onChange={e => setAboutQuote(e.target.value)} placeholder="Something Carson said about his future, in his own words…" maxLength={300} />
        </div>
        <button onClick={() => saveSetting('about_quote', aboutQuote || null)} disabled={saving.about_quote} style={{ ...S.saveBtn, opacity: saving.about_quote ? 0.6 : 1, marginBottom: 6 }}>
          {saving.about_quote ? 'Saving…' : 'Save Quote'}
        </button>
        {results.about_quote?.ok && <div style={S.successBox}>{results.about_quote.ok}</div>}
        {results.about_quote?.err && <div style={S.errBox}>{results.about_quote.err}</div>}

        <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

        <div style={S.fieldGroup}>
          <label style={S.label}>Interests & Activities <span style={{ color: 'var(--muted)', textTransform: 'none', fontWeight: 400 }}>(optional — comma separated)</span></label>
          <input style={S.input} value={aboutInterests} onChange={e => setAboutInterests(e.target.value)} placeholder="Football, Fishing, Cars, Music…" />
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>Each item separated by a comma shows as a tag on the About page.</div>
        </div>
        <button onClick={() => saveSetting('about_interests', aboutInterests || null)} disabled={saving.about_interests} style={{ ...S.saveBtn, opacity: saving.about_interests ? 0.6 : 1, marginBottom: 6 }}>
          {saving.about_interests ? 'Saving…' : 'Save Interests'}
        </button>
        {results.about_interests?.ok && <div style={S.successBox}>{results.about_interests.ok}</div>}
        {results.about_interests?.err && <div style={S.errBox}>{results.about_interests.err}</div>}
      </div>

      {/* Graduation Date */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Graduation Date & Time</div>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.55 }}>
          Controls the countdown clock on the homepage. Enter the date and time in <strong style={{ color: 'var(--text)' }}>Central Time (CT)</strong>.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            style={{ ...S.input, maxWidth: 260 }}
            type="datetime-local"
            value={graduationDate}
            onChange={e => setGraduationDate(e.target.value)}
          />
          <button onClick={() => saveSetting('graduation_date', graduationDate)} disabled={saving.graduation_date || !graduationDate} style={{ ...S.saveBtn, opacity: (saving.graduation_date || !graduationDate) ? 0.6 : 1 }}>
            {saving.graduation_date ? 'Saving…' : 'Save Date'}
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Example: 2026-06-01T18:00 = June 1, 2026 at 6:00 PM CT</div>
        {results.graduation_date?.ok && <div style={S.successBox}>{results.graduation_date.ok}</div>}
        {results.graduation_date?.err && <div style={S.errBox}>{results.graduation_date.err}</div>}
      </div>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [wishes, setWishes] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState('submissions') // 'submissions' | 'wishes' | 'settings'

  async function handleLogin(e) {
    e.preventDefault(); setError(null); setLoading(true)
    try {
      const [subRes, wishRes] = await Promise.all([
        fetch('/api/admin/pending', { headers: { 'x-admin-password': password } }),
        fetch('/api/admin/well-wishes', { headers: { 'x-admin-password': password } }),
      ])
      const subData = await subRes.json()
      if (subRes.status === 401) { setError('Wrong password.'); return }
      if (subData.error) { setError(subData.error); return }
      const wishData = await wishRes.json()
      setSubmissions(subData.submissions || [])
      setWishes(wishData.wishes || [])
      setAuthed(true)
    } catch { setError('Request failed.') }
    finally { setLoading(false) }
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const [subRes, wishRes] = await Promise.all([
        fetch('/api/admin/pending', { headers: { 'x-admin-password': password } }),
        fetch('/api/admin/well-wishes', { headers: { 'x-admin-password': password } }),
      ])
      const subData = await subRes.json()
      const wishData = await wishRes.json()
      if (!subData.error) setSubmissions(subData.submissions || [])
      if (!wishData.error) setWishes(wishData.wishes || [])
    } catch {}
    finally { setRefreshing(false) }
  }

  function handleUpdate(id) { setSubmissions(prev => prev.filter(s => s.id !== id)) }
  function handleWishUpdate(id) { setWishes(prev => prev.filter(w => w.id !== id)) }

  if (!authed) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/images/cardinal.png" alt="BC" style={{ height: 64, objectFit: 'contain', margin: '0 auto 16px' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginBottom: 6 }}>Admin Panel</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>For Carson · Submissions & Settings</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ ...S.label, marginBottom: 8 }}>Admin Password</label>
              <input type="password" style={S.input} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password…" autoFocus />
            </div>
            {error && <div style={{ ...S.errBox, marginBottom: 14 }}>{error}</div>}
            <button type="submit" disabled={loading || !password} style={{ ...S.primaryBtn, opacity: (loading || !password) ? 0.6 : 1, cursor: (loading || !password) ? 'not-allowed' : 'pointer' }}>
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
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,7,7,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Admin Panel</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {tab === 'submissions' && (
            <button onClick={handleRefresh} disabled={refreshing} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 16px', color: 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          )}
          <Link href="/" style={{ color: 'var(--muted)', fontSize: 13 }}>← Site</Link>
        </div>
      </nav>

      <div style={S.container}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => setTab('submissions')} style={S.tab(tab === 'submissions')}>
            Career Submissions {submissions.length > 0 ? `(${submissions.length})` : ''}
          </button>
          <button onClick={() => setTab('wishes')} style={S.tab(tab === 'wishes')}>
            Well Wishes {wishes.length > 0 ? `(${wishes.length})` : ''}
          </button>
          <button onClick={() => setTab('settings')} style={S.tab(tab === 'settings')}>
            Site Settings
          </button>
        </div>

        {/* Submissions Tab */}
        {tab === 'submissions' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 6 }}>Pending Career Submissions</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Approve to publish to the Career Wall. Reject to dismiss.</p>
            {submissions.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-heading)', marginBottom: 6 }}>All caught up!</div>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>No pending submissions right now.</p>
              </div>
            ) : (
              submissions.map(sub => <SubmissionCard key={sub.id} sub={sub} password={password} onUpdate={handleUpdate} />)
            )}
          </>
        )}

        {/* Well Wishes Tab */}
        {tab === 'wishes' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 6 }}>Pending Well Wishes</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Approve to publish to the Well Wishes wall. Reject to dismiss.</p>
            {wishes.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💌</div>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-heading)', marginBottom: 6 }}>All caught up!</div>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>No pending well wishes right now.</p>
              </div>
            ) : (
              wishes.map(w => {
                const from = w.is_anonymous ? 'Anonymous' : [w.name, w.city && w.state ? `${w.city}, ${w.state}` : (w.city || w.state)].filter(Boolean).join(' · ')
                return (
                  <WishCard key={w.id} wish={w} from={from} password={password} onUpdate={handleWishUpdate} />
                )
              })
            )}
          </>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 6 }}>Site Settings</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Changes go live immediately for all visitors.</p>
            <SettingsPanel password={password} />
          </>
        )}
      </div>
    </div>
  )
}
