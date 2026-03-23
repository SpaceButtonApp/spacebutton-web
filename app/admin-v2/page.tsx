'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminV2Page() {
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin-v2-auth')
    if (auth) {
      router.push('/admin-v2/dashboard')
    } else {
      router.push('/admin-v2/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  )
}
