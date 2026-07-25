'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supportApi } from '@/lib/api/support'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 16,
      height: 16,
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: '#ffffff',
      borderRadius: '50%',
      animation: 'sp-spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

export default function SupportLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [theme, setTheme] = useState<string | null>(null)

  useEffect(() => {
    if (localStorage.getItem('support-token')) { router.replace('/support'); return }
    const saved = localStorage.getItem('support-theme')
    if (saved) { setTheme(saved); return }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await supportApi.login(email, password)
      localStorage.setItem('support-token', data.access_token)
      localStorage.setItem('support-user', JSON.stringify(data.user))
      router.push('/support')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="support-portal-root"
      data-sp-theme={theme ?? undefined}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}
    >
      <style>{`@keyframes sp-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>

        {/* Logo + wordmark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png"
              alt="SpaceButton"
              style={{ width: 36, height: 36, objectFit: 'contain' }}
            />
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--sp-text-primary)', letterSpacing: '-0.02em' }}>
              SpaceButton
            </span>
          </div>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--sp-text-primary)', margin: 0 }}>
            Support Portal
          </h1>
          <p style={{ fontSize: 13, color: 'var(--sp-text-muted)', margin: 0 }}>
            Sign in to your support agent account
          </p>
        </div>

        {/* Card */}
        <div className="sp-settings-card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--sp-trend-down)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div className="sp-form-group" style={{ marginBottom: 0 }}>
              <label className="sp-form-input-label">Email address</label>
              <input
                type="email"
                className="sp-form-input"
                placeholder="agent@spacebutton.net"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="sp-form-group" style={{ marginBottom: 0 }}>
              <label className="sp-form-input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="sp-form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--sp-text-muted)',
                    cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center',
                  }}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="sp-btn sp-btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={loading}
            >
              {loading && <Spinner />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--sp-text-muted)', marginTop: 20 }}>
          Contact your admin if you have login issues.
        </p>
      </div>
    </div>
  )
}
