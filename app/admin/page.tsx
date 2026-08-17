'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminApp } from '@/components/admin/AdminApp'
import { getAdminLoginUrl } from '@/lib/api/admin'

export default function AdminPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    const token = localStorage.getItem('admin-token')

    if (!auth || !token) {
      router.replace(getAdminLoginUrl())
      return
    }

    // Decode JWT client-side to check expiry without a network call
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-auth')
        localStorage.removeItem('admin-profile')
        router.replace(getAdminLoginUrl())
        return
      }
    } catch {
      // Malformed token — treat as expired
      localStorage.removeItem('admin-token')
      localStorage.removeItem('admin-auth')
      router.replace(getAdminLoginUrl())
      return
    }

    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  return <AdminApp />
}
