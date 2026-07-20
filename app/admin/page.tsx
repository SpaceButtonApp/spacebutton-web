'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminApp } from '@/components/admin/AdminApp'

export default function AdminPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    if (!auth) {
      router.replace('/admin/login')
    } else {
      setReady(true)
    }
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
