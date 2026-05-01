'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AboutPage() {
  const [settings, setSettings] = useState({
    carson_photo: null,
    about_bio: '',
    about_quote: null,
    about_interests: null,
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { setSettings(prev => ({ ...prev, ...d })); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  const interests = settings.about_interests
    ? settings.about_interests.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,7,7,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/">
          <img src="/images/bcmark.png" alt="Bridge City Cardinals" style={{ height: 36, objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>← Home</Link>
          <Link href="/donate">
            <button
              style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-red)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
            >
              Donate
            </button>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 20px 80px' }}>

        {/* Photo + header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 56 }}>
          <div style={{ width: 140, height: 140, borderRadius: '50%', border: '4px solid var(--red)', overflow: 'hidden', background: 'var(--surface)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(217,30,42,0.2)' }}>
            {settings.carson_photo
              ? <img src={settings.carson_photo} alt="Carson Sauceda" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <img src="/images/cardinal.png" alt="Carson" style={{ width: '75%', height: '75%', objectFit: 'contain', opacity: loaded ? 0.35 : 0 }} />
            }
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
            Class of 2026 · Bridge City, TX
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.2rem, 7vw, 3.4rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
            Carson Sauceda
          </h1>

          <p style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 600 }}>
            Bridge City High School · Bridge City Cardinals
          </p>
        </div>

        {/* Bio */}
        {settings.about_bio && (
          <div style={{ marginBottom: 48 }}>
            {settings.about_bio.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: 'clamp(15px, 2.5vw, 17px)', lineHeight: 1.8, color: 'var(--text)', marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
              Interests & Activities
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {interests.map((item, i) => (
                <span key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '7px 18px', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quote from Carson */}
        {settings.about_quote && (
          <div style={{ marginBottom: 48, borderLeft: '4px solid var(--red)', paddingLeft: 24 }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontStyle: 'italic', lineHeight: 1.6, color: 'var(--text)', marginBottom: 10 }}>
              "{settings.about_quote}"
            </p>
            <span style={{ fontSize: 14, color: 'var(--red)', fontWeight: 700 }}>— Carson Sauceda</span>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', marginBottom: 48 }} />

        {/* CTA */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
          <img src="/images/cardinal.png" alt="Cardinal" style={{ height: 64, objectFit: 'contain', margin: '0 auto 20px' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, marginBottom: 12 }}>
            Help shape what comes next.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.65, maxWidth: 440, margin: '0 auto 28px' }}>
            Share your career story and donate — give Carson a real map of what's possible after Bridge City.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/donate">
              <button
                style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-red)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
              >
                Donate & Share Your Story
              </button>
            </Link>
            <Link href="/well-wishes">
              <button style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 28px', color: 'var(--muted)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                Send Well Wishes
              </button>
            </Link>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
          <img src="/images/bcmark.png" alt="BC" style={{ height: 18, objectFit: 'contain' }} />
          <span>For Carson · Bridge City Cardinals · Class of 2026</span>
        </div>
        <div>Made with love by Dad</div>
      </footer>
    </div>
  )
}
