'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supportApi } from '@/lib/api/support'

export default function SupportLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('support-token')) router.replace('/support')
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
    <div className="support-portal-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png"
            alt="SpaceButton"
            style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 16 }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--sp-text-primary)', marginBottom: 6 }}>
            Support Portal
          </h1>
          <p style={{ fontSize: 13, color: 'var(--sp-text-muted)' }}>Sign in to your support agent account</p>
        </div>

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
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--sp-text-muted)', cursor: 'pointer', fontSize: 11 }}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="sp-btn sp-btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, marginTop: 4 }}
              disabled={loading}
            >
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
