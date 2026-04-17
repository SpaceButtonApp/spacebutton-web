'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sun, Moon, Monitor, ChevronRight, Star, Home, Users, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'

export default function LandingPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      setTheme(saved)
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(saved === 'dark' || (!saved && prefersDark))
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('theme', theme)
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = theme === 'system' ? prefersDark : theme === 'dark'
    setIsDark(shouldBeDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme, mounted])

  if (!mounted) return null

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'
  const heroImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/landing%20page.png-I0ZbNvhA7dQCxWvGX9x3vzISnKcMYG.jpeg'

  return (
    <div className={cn(isDark ? 'dark' : 'light')}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src={logoUrl} alt="SpaceButton" width={36} height={36} className="h-9 w-9" />
              <span className="font-bold text-lg text-foreground">SpaceButton</span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <div className="flex items-center bg-secondary rounded-full p-1 border border-border">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Light mode"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    theme === 'system' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="System"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Dark mode"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Auth Buttons */}
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/sign-up')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                    Find Your Dream{' '}
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Space
                    </span>
                  </h1>
                  <p className="text-base md:text-lg text-muted-foreground mt-4 md:mt-6 leading-relaxed">
                    Discover the perfect property or find your next amazing rental. Connect directly with verified owners and agents on SpaceButton.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => router.push('/get-started')}
                    className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-lg text-sm md:text-base"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => router.push('/get-started')}
                    className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all text-sm md:text-base"
                  >
                    Browse Listings
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-4 md:pt-8">
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-foreground">20k+</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Happy Users</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-foreground">5k+</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Listed Spaces</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-foreground">15+</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Years Experience</p>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative h-64 md:h-96 lg:h-full min-h-[400px] md:min-h-[500px]">
                <Image
                  src={heroImage}
                  alt="Modern house exterior"
                  fill
                  className="object-cover rounded-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">Why Choose SpaceButton?</h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Everything you need to find and connect with properties and property owners
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: Home, title: 'Verified Listings', desc: 'All properties are verified and authentic' },
                { icon: Users, title: 'Direct Connection', desc: 'Chat directly with owners and agents' },
                { icon: Zap, title: 'Fast & Easy', desc: 'Simple search and booking process' },
                { icon: Star, title: 'Trusted Community', desc: 'Reviews and ratings from real users' },
                { icon: Home, title: 'Multiple Options', desc: 'Browse connect, agent, and property listings' },
                { icon: Zap, title: 'Secure Platform', desc: 'Your privacy and security is our priority' },
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start md:items-center justify-between mb-8 md:mb-12 flex-col md:flex-row gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Properties</h2>
                <p className="text-muted-foreground text-sm md:text-base">Discover our handpicked selection of premium listings</p>
              </div>
              <button
                onClick={() => router.push('/get-started')}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm md:text-base whitespace-nowrap"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => router.push('/get-started')}
                  className="group rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl text-left"
                >
                  <div className="relative h-48 md:h-64 bg-muted overflow-hidden">
                    <Image
                      src={heroImage}
                      alt={`Property ${i}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="font-semibold text-foreground mb-1">Modern House {i}</h3>
                    <p className="text-sm text-muted-foreground mb-3 md:mb-4">Lagos, Nigeria</p>
                    <p className="font-bold text-primary text-lg md:text-xl">${(500000 * i).toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
              Ready to Find Your Perfect Space?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
              Join thousands of happy users who found their dream property on SpaceButton
            </p>
            <button
              onClick={() => router.push('/get-started')}
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-lg text-sm md:text-base"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Image src={logoUrl} alt="SpaceButton" width={32} height={32} className="h-8 w-8" />
                  <span className="font-bold text-foreground">SpaceButton</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">Finding your dream space, made easy.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3 md:mb-4 text-sm">Product</h4>
                <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Browse</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Features</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Pricing</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3 md:mb-4 text-sm">Company</h4>
                <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">About</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Blog</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Contact</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3 md:mb-4 text-sm">Legal</h4>
                <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Privacy</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Terms</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Support</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-6 md:pt-8">
              <p className="text-center text-xs md:text-sm text-muted-foreground">
                © 2026 SpaceButton. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
