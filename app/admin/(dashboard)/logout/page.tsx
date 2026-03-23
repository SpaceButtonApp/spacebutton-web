'use client'

import { useRouter } from 'next/navigation'
import { Power } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LogoutPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="bg-card rounded-2xl border border-border p-12 max-w-sm text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <Power className="w-10 h-10 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold mb-2">LOG OUT</h2>
        <p className="text-muted-foreground mb-8">
          Are you sure you would like to log out of your account?
        </p>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={() => router.back()}
          >
            No
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl bg-destructive hover:bg-destructive/90"
            onClick={handleLogout}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  )
}
