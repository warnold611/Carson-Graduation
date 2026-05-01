import './globals.css'

export const metadata = {
  title: 'For Carson | Class of 2026 · Bridge City, TX',
  description: 'Carson Sauceda is graduating from Bridge City High School. Help shape what comes next — share your career story and show him what\'s possible.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://forcarson.com'),
  openGraph: {
    title: 'For Carson | Class of 2026',
    description: 'Share your career story and help shape what comes next for Carson Sauceda.',
    type: 'website',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'For Carson',
  },
}

export const viewport = {
  themeColor: '#D91E2A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  )
}
