'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const GRADUATION_DATE = new Date('2026-06-01T23:00:00Z') // June 1, 2026 6pm CDT

const INDUSTRIES = [
  'All', 'Technology', 'Healthcare', 'Energy', 'Petrochemical',
  'Trades', 'Finance', 'Education', 'Military', 'Real Estate',
  'Transportation', 'Government', 'Other',
]

function formatSalary(min, max) {
  if (!min && !max) return null
  const fmt = n => '$' + Number(n).toLocaleString()
  if (min && max) return `${fmt(min)} – ${fmt(max)}/yr`
  if (min) return `${fmt(min)}+/yr`
  return `up to ${fmt(max)}/yr`
}

function getTimeLeft(target) {
  const diff = target - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: false,
  }
}

function collegeColor(val) {
  if (val === 'Yes') return { bg: 'rgba(232,192,32,0.15)', color: '#E8C020', label: 'College Required' }
  if (val === 'No') return { bg: 'rgba(76,175,134,0.15)', color: '#4CAF86', label: 'No Degree Needed' }
  return { bg: 'rgba(155,130,130,0.15)', color: '#9B8282', label: 'Depends on Path' }
}

function CountdownUnit({ value, label }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 64 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
        {label}
      </div>
    </div>
  )
}

function CareerCard({ sub }) {
  const d = sub.donations
  const salary = formatSalary(sub.salary_min, sub.salary_max)
  const college = collegeColor(sub.college_required)
  const name = d?.is_anonymous ? 'Anonymous' : (d?.donor_name || 'A Friend')
  const location = d?.is_anonymous ? null : [d?.donor_city, d?.donor_state].filter(Boolean).join(', ')

  return (
    <div
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color 0.2s, background 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(217,30,42,0.4)'; e.currentTarget.style.background = 'var(--surface-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
    >
      <div>
        <div style={{ fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{sub.career}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{name}{location ? ` · ${location}` : ''}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ background: 'rgba(217,30,42,0.12)', color: 'var(--red)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>{sub.industry}</span>
        <span style={{ background: college.bg, color: college.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>{college.label}</span>
        {sub.timeline && <span style={{ background: 'rgba(155,130,130,0.12)', color: 'var(--muted)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>{sub.timeline}</span>}
      </div>
      {salary && <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>{salary}</div>}
      {sub.description && <p style={{ fontSize: 14, color: 'var(--text)', opacity: 0.85, lineHeight: 1.55 }}>{sub.description}</p>}
      {sub.advice && (
        <blockquote style={{ borderLeft: '2px solid var(--red)', paddingLeft: 12, fontSize: 14, fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.55, marginTop: 4 }}>
          "{sub.advice}"
        </blockquote>
      )}
    </div>
  )
}

export default function HomePage() {
  const [countdown, setCountdown] = useState(() => getTimeLeft(GRADUATION_DATE))
  const [stats, setStats] = useState({ donorCount: 0, storyCount: 0, stateCount: 0, cityCount: 0 })
  const [donors, setDonors] = useState([])
  const [stories, setStories] = useState([])
  const [filter, setFilter] = useState('All')
  const [statsLoaded, setStatsLoaded] = useState(false)
  const [settings, setSettings] = useState({
    carson_photo: null,
    dads_note: '',
    donor_goal: '50',
    site_subtitle: 'Carson Sauceda is graduating from Bridge City High School and figuring out who he wants to be. Donate and share your career story — give him a real map of what\'s possible.',
  })

  useEffect(() => {
    const tick = () => setCountdown(getTimeLeft(GRADUATION_DATE))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(prev => ({ ...prev, ...d }))).catch(() => {})
    fetch('/api/stats').then(r => r.json()).then(d => { setStats(d); setStatsLoaded(true) }).catch(() => setStatsLoaded(true))
    fetch('/api/honor-roll').then(r => r.json()).then(d => setDonors(d.donors || [])).catch(() => {})
    fetch('/api/career-wall').then(r => r.json()).then(d => setStories(d.submissions || [])).catch(() => {})
  }, [])

  async function handleShare() {
    const shareData = { title: 'For Carson | Class of 2026', text: 'Help shape what comes next for Carson Sauceda, Bridge City HS Class of 2026.', url: window.location.href }
    if (navigator.share) { try { await navigator.share(shareData) } catch {} }
    else { try { await navigator.clipboard.writeText(window.location.href); alert('Link copied!') } catch {} }
  }

  const filteredStories = filter === 'All' ? stories : stories.filter(s => s.industry === filter)
  const donorGoal = parseInt(settings.donor_goal) || 50
  const goalPct = Math.min(100, Math.round((stats.donorCount / donorGoal) * 100))

  const btnStyle = {
    background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,7,7,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="/images/bcmark.png" alt="Bridge City Cardinals" style={{ height: 36, objectFit: 'contain' }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={handleShare} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', color: 'var(--muted)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Share
          </button>
          <Link href="/donate">
            <button style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-red)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}>
              Donate
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
            {/* Carson Photo — read-only on homepage, set only via admin */}
            <div style={{ width: 120, height: 120, borderRadius: '50%', border: '3px solid var(--red)', overflow: 'hidden', flexShrink: 0, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {settings.carson_photo
                ? <img src={settings.carson_photo} alt="Carson" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <img src="/images/cardinal.png" alt="Carson" style={{ width: '80%', height: '80%', objectFit: 'contain', opacity: 0.4 }} />
              }
            </div>
            <img src="/images/cardinal.png" alt="Bridge City Cardinal" style={{ height: 110, objectFit: 'contain', flexShrink: 0 }} />
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Class of 2026 · Bridge City, TX
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 8vw, 3.8rem)', fontWeight: 700, textAlign: 'center', lineHeight: 1.15, maxWidth: 680 }}>
            Help shape what comes next.
          </h1>

          <p style={{ fontSize: 'clamp(15px, 3vw, 18px)', color: 'var(--muted)', textAlign: 'center', maxWidth: 540, lineHeight: 1.6 }}>
            {settings.site_subtitle}
          </p>

          <Link href="/donate">
            <button
              style={{ ...btnStyle, padding: '14px 36px', fontSize: 17, borderRadius: 10, boxShadow: '0 0 32px rgba(217,30,42,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-red)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
            >
              Donate & Share Your Story →
            </button>
          </Link>
        </div>
      </section>

      {/* COUNTDOWN */}
      {!countdown.done && (
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 48px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Graduation Countdown</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 5vw, 40px)', flexWrap: 'wrap' }}>
              <CountdownUnit value={countdown.days} label="Days" />
              <CountdownUnit value={countdown.hours} label="Hours" />
              <CountdownUnit value={countdown.minutes} label="Min" />
              <CountdownUnit value={countdown.seconds} label="Sec" />
            </div>
            <div style={{ marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>June 1, 2026 · Bridge City High School</div>
          </div>
        </section>
      )}

      {/* STATS + GOAL */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 60px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { label: 'Donors', value: stats.donorCount },
            { label: 'Stories', value: stats.storyCount },
            { label: 'States', value: stats.stateCount },
            { label: 'Cities', value: stats.cityCount },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', textAlign: 'center', flex: 1, minWidth: 100 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 700, color: 'var(--red)', lineHeight: 1 }}>
                {statsLoaded ? value : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Donor Goal Progress Bar */}
        {statsLoaded && donorGoal > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                {stats.donorCount} of {donorGoal} donors
              </span>
              <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 700 }}>{goalPct}%</span>
            </div>
            <div style={{ background: 'rgba(217,30,42,0.1)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
              <div style={{ background: 'var(--red)', borderRadius: 99, height: '100%', width: `${goalPct}%`, transition: 'width 0.8s ease', boxShadow: '0 0 8px rgba(217,30,42,0.5)' }} />
            </div>
            {goalPct >= 100 && (
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--green)', fontWeight: 700, textAlign: 'center' }}>
                🎉 Goal reached! Thank you!
              </div>
            )}
          </div>
        )}
      </section>

      {/* DAD'S NOTE */}
      {settings.dads_note && (
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 64px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--red)', borderRadius: '0 16px 16px 0', padding: '32px 32px 32px 28px' }}>
            <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>A Note from Dad</div>
            {settings.dads_note.split('\n\n').map((para, i, arr) => (
              <p key={i} style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', color: i === arr.length - 1 ? 'var(--muted)' : 'var(--text)', lineHeight: 1.7, marginBottom: i < arr.length - 1 ? 14 : 0, fontStyle: i === arr.length - 1 ? 'italic' : 'normal', whiteSpace: 'pre-wrap' }}>
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* HONOR ROLL */}
      {donors.length > 0 && (
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 64px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>Honor Roll</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {donors.map(d => (
              <div key={d.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 16px', fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                {d.is_anonymous ? '🎗 Anonymous' : [d.donor_name || 'Friend', d.donor_city ? `· ${d.donor_city}` : null, d.donor_state ? `, ${d.donor_state}` : null].filter(Boolean).join(' ')}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CAREER WALL */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700 }}>Career Wall</h2>
          <Link href="/donate">
            <button
              style={{ background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--red)' }}
            >
              + Add Your Story
            </button>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              onClick={() => setFilter(ind)}
              style={{ background: filter === ind ? 'var(--red)' : 'var(--surface)', border: `1px solid ${filter === ind ? 'var(--red)' : 'var(--border)'}`, borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600, color: filter === ind ? '#fff' : 'var(--muted)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
            >
              {ind}
            </button>
          ))}
        </div>

        {filteredStories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
              {stories.length === 0 ? 'Be the first to share your story.' : `No ${filter} stories yet.`}
            </div>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 15 }}>Your career path could be exactly what Carson needs to see.</p>
            <Link href="/donate">
              <button style={{ ...btnStyle, padding: '12px 28px' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-red)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}>
                Share Your Story
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: 20 }}>
            {filteredStories.map(sub => <CareerCard key={sub.id} sub={sub} />)}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <img src="/images/bcmark.png" alt="BC" style={{ height: 20, objectFit: 'contain' }} />
          <span>For Carson · Bridge City Cardinals · Class of 2026</span>
        </div>
        <div>Made with love by Dad · Not tax deductible</div>
      </footer>
    </div>
  )
}
