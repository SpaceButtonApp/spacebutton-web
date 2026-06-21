'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useEffect } from 'react'
import { useTheme } from 'next-themes'
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
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const logoIcon = '/logo.png'

  useEffect(() => {
    if (user?.isLoggedIn) {
      router.replace('/home')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-16">
          <Image
            src={logoIcon}
            alt="Spacebutton"
            width={40}
            height={69}
            className="h-7 w-auto"
            style={{ width: 'auto' }}
            loading="eager"
            priority
          />
          <span className="text-xl font-bold text-foreground">SpaceButton</span>
        </div>

        {/* Hero Image/Illustration */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="relative w-full max-w-sm aspect-square">
            {/* Decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-primary/10 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-primary/20" />
            </div>
            
            {/* Main icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30">
                <Home className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute top-8 right-4 bg-card rounded-xl p-3 shadow-lg border border-border animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-success" />
                </div>
                <span className="text-xs font-medium text-foreground">Verified</span>
              </div>
            </div>

            <div className="absolute bottom-12 left-0 bg-card rounded-xl p-3 shadow-lg border border-border animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">10k+ Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 text-balance text-foreground">
            Find Your Perfect Space
          </h1>
          <p className="text-muted-foreground text-balance">
            Connect with vacating tenants, landlords, and verified agents.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-card border border-border flex items-center justify-center mb-2">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs font-medium text-foreground">{feature.title}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/signup')}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="w-full h-14 rounded-xl border-border bg-transparent text-foreground hover:bg-secondary font-semibold text-base"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}
