'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'

const SITE_URL = 'https://carson-graduation-bbon.vercel.app'

export default function QRPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function handlePrint() { window.print() }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .print-card {
            background: #fff !important;
            color: #0D0707 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

        {/* Nav */}
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(13,7,7,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50 }}>
          <Link href="/">
            <img src="/images/bcmark.png" alt="BC" style={{ height: 36, objectFit: 'contain' }} />
          </Link>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handlePrint}
              style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* QR Card — the printable zone */}
        <div className="print-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 420, width: '100%', marginTop: 20 }}>
          {/* BC Mark */}
          <img src="/images/bcmark.png" alt="Bridge City Cardinals" style={{ height: 40, objectFit: 'contain', margin: '0 auto 24px' }} />

          {/* QR Code */}
          <div style={{ display: 'inline-block', background: '#fff', padding: 16, borderRadius: 16, marginBottom: 24 }}>
            {mounted && (
              <QRCodeSVG
                value={SITE_URL}
                size={220}
                bgColor="#ffffff"
                fgColor="#0D0707"
                level="H"
                imageSettings={{
                  src: '/images/cardinal.png',
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            )}
          </div>

          {/* Text */}
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>
            For Carson
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>
            Class of 2026 · Bridge City Cardinals
          </p>
          <p style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600, marginBottom: 20 }}>
            Scan to donate & share your career story
          </p>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'monospace', background: 'rgba(217,30,42,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', display: 'inline-block' }}>
            {SITE_URL.replace('https://', '')}
          </div>
        </div>

        {/* Instructions */}
        <div className="no-print" style={{ marginTop: 32, maxWidth: 420, width: '100%' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Business Card Tips
            </div>
            <ul style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 18 }}>
              <li>Click <strong style={{ color: 'var(--text)' }}>Print / Save PDF</strong> to save a high-res version</li>
              <li>QR code has a Cardinal mascot embedded in the center</li>
              <li>Works at any size down to ~1"×1" on a business card</li>
              <li>Error correction level H — reads even if slightly damaged</li>
            </ul>
          </div>
        </div>

      </div>
    </>
  )
}
