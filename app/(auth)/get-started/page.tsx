'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { ArrowRight, Home, Search, Shield, Users } from 'lucide-react'

const features = [
  {
    icon: Home,
    title: 'Find Your Space',
    description: 'Browse thousands of verified apartments',
  },
  {
    icon: Users,
    title: 'Connect Directly',
    description: 'Chat with agents and landlords',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Verified listings and secure payments',
  },
]

export default function GetStartedPage() {
  const router = useRouter()
  const user = useAppStore((state) => state.user)

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dark%20mode%20logo-CjRTz9JJQtYa2G7RQELe0ZpCK7Ox6J.png'
  const logoIcon = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  useEffect(() => {
    if (user?.isLoggedIn) {
      router.replace('/home')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-[#703BF7]/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 -right-40 w-80 h-80 bg-[#703BF7]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#703BF7]/5 rounded-full blur-[100px]" />
      </div>
      
      {/* Content */}
      <div className="relative flex-1 flex flex-col px-6 py-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-16">
          <Image
            src={logoIcon}
            alt="Spacebutton"
            width={32}
            height={32}
            className="h-8 w-8"
            loading="eager"
            priority
          />
          <span className="text-xl font-bold text-white">SpaceButton</span>
        </div>

        {/* Hero Image/Illustration */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="relative w-full max-w-sm aspect-square">
            {/* Decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-[#703BF7]/10 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-[#703BF7]/20" />
            </div>
            
            {/* Main icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#703BF7] to-[#5f32d4] flex items-center justify-center shadow-2xl shadow-[#703BF7]/30">
                <Home className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute top-8 right-4 bg-[#12121a] rounded-xl p-3 shadow-lg border border-gray-800 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-xs font-medium text-white">Verified</span>
              </div>
            </div>

            <div className="absolute bottom-12 left-0 bg-[#12121a] rounded-xl p-3 shadow-lg border border-gray-800 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#703BF7]/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#703BF7]" />
                </div>
                <span className="text-xs font-medium text-white">10k+ Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 text-balance text-white">
            Find Your Perfect Space
          </h1>
          <p className="text-gray-400 text-balance">
            Find your dream apartment. Connect with vacating tenants, landlords, and verified agents.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#12121a] border border-gray-800 flex items-center justify-center mb-2">
                <feature.icon className="w-6 h-6 text-[#703BF7]" />
              </div>
              <p className="text-xs font-medium text-white">{feature.title}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/signup')}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#703BF7] to-[#5f32d4] hover:from-[#8b5cf6] hover:to-[#703BF7] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#703BF7]/20"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="w-full h-14 rounded-xl border-gray-800 bg-transparent text-white hover:bg-gray-800/50 font-semibold text-base"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}
