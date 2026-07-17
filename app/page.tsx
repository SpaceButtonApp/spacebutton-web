'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sun, Moon, Monitor, ChevronRight, ChevronDown, MapPin, Home, DollarSign, Grid3X3, Star, Search, Heart, Zap, Shield, TrendingUp, Clock, CheckCircle, Users, Building, MessageCircle, Sparkles, Play, Smartphone, Bell, User } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'

export default function LandingPage() {
  const router = useRouter()
  const { properties } = useAppStore()
  const [theme, setTheme] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  // Typewriter effect state
  const [typewriterText, setTypewriterText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const fullText = 'with SpaceButton'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      setTheme(saved)
    } else {
      setTheme('system')
    }
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (!mounted) return
    
    let timeout: NodeJS.Timeout
    
    if (!isDeleting && typewriterText.length < fullText.length) {
      timeout = setTimeout(() => {
        setTypewriterText(fullText.slice(0, typewriterText.length + 1))
      }, 80 + Math.random() * 40)
    } else if (!isDeleting && typewriterText.length === fullText.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true)
      }, 10000)
    } else if (isDeleting && typewriterText.length > 0) {
      timeout = setTimeout(() => {
        setTypewriterText(typewriterText.slice(0, -1))
      }, 40 + Math.random() * 20)
    } else if (isDeleting && typewriterText.length === 0) {
      setIsDeleting(false)
    }
    
    return () => clearTimeout(timeout)
  }, [typewriterText, isDeleting, mounted])

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
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
  


  const faqs = [
    {
      q: 'Is SpaceButton a registered and verified platform?',
      a: 'Yes. SpaceButton is a legally registered business under the Corporate Affairs Commission (CAC) of Nigeria. We are fully compliant with Nigerian law and operate under the Companies and Allied Matters Act (CAMA), 2020. We are also registered with the Nigeria Data Protection Commission (NDPC) and take your privacy and data security seriously. All user data is handled in accordance with the Nigeria Data Protection Act, 2023.'
    },
    {
      q: 'Is my personal data safe on SpaceButton?',
      a: 'Yes. SpaceButton is registered with the Nigeria Data Protection Commission (NDPC) and complies with the Nigeria Data Protection Act, 2023. We implement strong security measures to protect your information and never share your data with third parties without your consent.'
    },
    {
      q: 'How do I search for Spaces on SpaceButton?',
      a: 'Simply use our search bar to filter by location, price range, property type, and amenities. You can also browse featured listings or use our map view to find properties in your preferred area.'
    },
    {
      q: 'What documents do I need to list my Space?',
      a: 'To list your property, you\'ll need proof of ownership or authorization to rent, valid ID, property photos, and basic details about the space. Our team will guide you through the verification process.'
    },
    {
      q: 'Are there any inspection fees?',
      a: 'No! SpaceButton eliminates inspection fees. You can connect directly with property owners and agents without paying to view properties. This is one of our core promises to users.'
    },
    {
      q: 'How do I contact a property owner or agent?',
      a: 'Once you find a property you like, click "Connect" to start a conversation. You can chat directly through our platform, schedule viewings, and negotiate terms - all in one place.'
    },
    {
      q: 'Is my personal information safe?',
      a: 'Absolutely. We use industry-standard encryption and never share your personal details without consent. All users go through verification to ensure a safe community.'
    }
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds with your email or phone number. Complete your profile to unlock all features.',
      icon: Users
    },
    {
      step: '02',
      title: 'Search or List',
      description: 'Browse thousands of verified listings or post your own property in minutes with our easy listing tool.',
      icon: Search
    },
    {
      step: '03',
      title: 'Connect Directly',
      description: 'Chat with property owners, agents, or potential tenants directly. No middlemen, no hidden fees.',
      icon: MessageCircle
    },
    {
      step: '04',
      title: 'Close the Deal',
      description: 'Found your perfect space? Finalize the agreement and move in. It\'s that simple!',
      icon: CheckCircle
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'Every property is verified to ensure authenticity and protect you from scams.'
    },
    {
      icon: Zap,
      title: 'Instant Connection',
      description: 'Connect with property owners in real-time through our in-app messaging system.'
    },
    {
      icon: Heart,
      title: 'Save Favorites',
      description: 'Bookmark properties you love and get notified when prices drop or status changes.'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Access real-time market data to make informed decisions about renting or buying.'
    },
    {
      icon: Clock,
      title: 'Quick Listings',
      description: 'List your property in under 5 minutes with our streamlined posting process.'
    },
    {
      icon: Building,
      title: 'All Property Types',
      description: 'From apartments to commercial spaces, find every type of property in one place.'
    }
  ]

  const stats = [
    { value: '20K+', label: 'Happy Users' },
    { value: '100K+', label: 'Listed Properties' },
    { value: '50+', label: 'Cities Covered' },
    { value: '4.9', label: 'App Rating', icon: Star }
  ]

  return (
    <div className={cn(isDark ? 'dark' : 'light')}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">


        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <Image src={logoUrl} alt="SpaceButton" width={40} height={69} className="h-7 w-auto" style={{ width: 'auto' }} />
              <span className="font-bold text-base sm:text-lg text-foreground">SpaceButton</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => router.push('/get-started')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</button>
              <button onClick={() => router.push('/get-started')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</button>
              <button onClick={() => router.push('/get-started')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Properties</button>
              <button onClick={() => router.push('/get-started')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center bg-secondary rounded-full p-1 border border-border">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'p-1.5 sm:p-2 rounded-full transition-colors',
                    theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Light mode"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    'p-1.5 sm:p-2 rounded-full transition-colors',
                    theme === 'system' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="System"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'p-1.5 sm:p-2 rounded-full transition-colors',
                    theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Dark mode"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => router.push('/login')}
                className="hidden sm:block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-foreground hover:bg-secondary transition-colors text-xs sm:text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Going live soon
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground tracking-tight">
                  Find Your Dream Space<br />
                  <span className="text-primary">
                    {typewriterText}
                    <span className={cn("inline-block w-[3px] h-[1em] bg-primary ml-1 align-middle", showCursor ? "opacity-100" : "opacity-0")} />
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mt-6 leading-relaxed max-w-2xl mx-auto">
                  Your journey to finding the perfect Space begins here. <span className="text-foreground font-medium">No agent fees. No inspection fees.</span> No stress. Just real connections.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/get-started')}
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/25 text-base"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/get-started')}
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all text-base border border-border"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>


            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-8 bg-card border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-background rounded-2xl p-4 sm:p-6 shadow-lg border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3 border border-border">
                  <MapPin className="w-5 h-5 text-primary" />
                  <input type="text" placeholder="Location" className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3 border border-border">
                  <Home className="w-5 h-5 text-primary" />
                  <input type="text" placeholder="Property Type" className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3 border border-border">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <input type="text" placeholder="Budget" className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
                </div>
                <button
                  onClick={() => router.push('/get-started')}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all py-3"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Simple Process</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How SpaceButton Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Find your perfect space in four easy steps. Our streamlined process makes property hunting effortless.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, i) => (
                <div key={i} className="relative group">
                  <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg h-full">
                    <div className="text-5xl font-bold text-primary/20 mb-4">{item.step}</div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features/Benefits */}
        <section className="py-16 sm:py-20 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Why Choose Us</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Everything You Need in One Platform</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">SpaceButton combines powerful features with simplicity to give you the best property search experience.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="bg-background rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>




        {/* FAQs */}
        <section className="py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about SpaceButton. Can&apos;t find your answer? Contact our support team.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div 
                  key={i} 
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
                  >
                    <h3 className="font-semibold text-foreground pr-4">{faq.q}</h3>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                      openFaq === i && "rotate-180"
                    )} />
                  </button>
                  <div className={cn(
                    "grid transition-all duration-300",
                    openFaq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}>
                    <div className="overflow-hidden">
                      <p className="px-6 pb-4 text-muted-foreground">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-primary rounded-3xl p-8 sm:p-12 overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
              </div>
              
              <div className="relative text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
                  Ready to Find Your Perfect Space?
                </h2>
                <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                  Join over 20,000 users who have already found their dream homes through SpaceButton. Start your journey today - it&apos;s completely free!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/signup')}
                    className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-all hover:shadow-lg"
                  >
                    Create Free Account
                  </button>
                  <button
                    onClick={() => router.push('/get-started')}
                    className="px-8 py-4 bg-transparent text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Browse Properties
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App Download Section */}
        <section className="py-16 sm:py-20 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                  <Smartphone className="w-4 h-4" />
                  Coming Soon on Mobile
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Take SpaceButton Everywhere You Go
                </h2>
                <p className="text-lg text-muted-foreground">
                  Download our mobile app to browse properties, chat with landlords, and manage your listings on the go. Get instant notifications when new spaces match your preferences.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Instant Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get notified immediately when a new property matches your search criteria.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Chat on the Go</h4>
                      <p className="text-sm text-muted-foreground">Communicate with landlords and agents directly from your phone.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Location-Based Search</h4>
                      <p className="text-sm text-muted-foreground">Find properties near you with GPS-powered location search.</p>
                    </div>
                  </div>
                </div>

                {/* App Store Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button className="flex items-center gap-3 px-6 py-3 bg-foreground text-background rounded-xl hover:opacity-90 transition-all">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-xs opacity-80">Download on the</p>
                      <p className="text-base font-semibold">App Store</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 px-6 py-3 bg-foreground text-background rounded-xl hover:opacity-90 transition-all">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-xs opacity-80">Get it on</p>
                      <p className="text-base font-semibold">Google Play</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Right Side - Phone Mockups */}
              <div className="flex gap-4 justify-center lg:justify-end overflow-x-auto pb-4">
                {/* Light Mode */}
                <div className="flex-shrink-0">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/light%20mode.png-DHrBM6kBfE4WnZOza5J67VtndVRxlb.jpeg"
                    alt="SpaceButton App - Light Mode"
                    width={280}
                    height={560}
                    className="w-64 sm:w-72 h-auto rounded-3xl shadow-2xl border-8 border-primary"
                    unoptimized
                  />
                </div>

                {/* Dark Mode */}
                <div className="flex-shrink-0">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dark%20Mode.png-OxqRQSX06JbIUzkdplL8QFNgD8FwUG.jpeg"
                    alt="SpaceButton App - Dark Mode"
                    width={280}
                    height={560}
                    className="w-64 sm:w-72 h-auto rounded-3xl shadow-2xl border-8 border-primary"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
              <div className="col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <Image src={logoUrl} alt="SpaceButton" width={40} height={69} className="h-7 w-auto" style={{ width: 'auto' }} />
                  <span className="font-bold text-foreground">SpaceButton</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Finding your dream space, made easy. No agent fees. No inspection fees. Just real connections.</p>
                <div className="flex gap-3">
                  <a href="https://www.facebook.com/SpaceButton/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://x.com/spacebutton_net?s=21" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="X (Twitter)">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.693-5.833 6.693H2.562l7.746-8.853L1.254 2.25h6.554l4.821 6.383L18.244 2.25zM16.735 20.875h1.883L5.283 4.288H3.247L16.735 20.875z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/spacebutton_net?igsh=MTlmaGV5NXYxbmZjdA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="Instagram">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://www.tiktok.com/@spacebutton_net?_r=1&_t=ZS-97DJIIiVnui" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="TikTok">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.498 3.09C17.873 1.465 15.299 0 12.04 0H8.171C4.939 0 2.314 2.625 2.314 5.857v12.286C2.314 21.375 4.939 24 8.171 24h3.868c3.231 0 5.857-2.625 5.857-5.857V8.571c1.25.893 2.768 1.429 4.375 1.429v-3.43c-2.25 0-4.321-.857-5.973-2.25zM17.143 18.143c0 1.607-1.286 2.893-2.893 2.893H8.171c-1.607 0-2.893-1.286-2.893-2.893V5.857c0-1.607 1.286-2.893 2.893-2.893h5.979c1.607 0 2.893 1.286 2.893 2.893v12.286z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/in/space-button-ab9551413" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="LinkedIn">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                  <a href="mailto:info@spacebutton.net" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="Email">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  </a>
                  <a href="https://wa.me/09034466046" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" title="WhatsApp">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.025 0-2.031.313-2.911.89L7.5 3.868 8.396 6.75c-.632.883-1.002 1.925-1.002 3.024 0 3.289 2.68 5.969 5.97 5.969 1.593 0 3.087-.631 4.213-1.768 1.126-1.137 1.747-2.631 1.747-4.213 0-3.289-2.68-5.969-5.97-5.969zm0-2.868C18.707 3.111 22 6.404 22 10.666c0 4.262-3.293 7.556-7.347 7.556-1.292 0-2.542-.315-3.657-.933l-4.18 1.381 1.381-4.18C3.315 13.208 3 12.05 3 10.758 3 6.496 6.293 3.202 10.555 3.202z"/></svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Company</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">About Us</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Our Team</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Careers</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Press</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Properties</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Browse Listings</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">List Your Property</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Featured Homes</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">New Listings</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Resources</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Help Center</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Blog</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Guides</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">FAQs</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Privacy Policy</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Terms of Service</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Cookie Policy</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Contact Us</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  © 2026 SpaceButton. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Terms</button>
                  <button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Privacy</button>
                  <button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Cookies</button>
                </div>
              </div>
              <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CAC-DbDwrt0HNLVQxjrq5uqfjfVo0vSkFU.png"
                    alt="CAC Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Registered with CAC<br />(RC: 9510448)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NDPC-dw3AsaZsvSJjEgnk7c2uVxcqzRwtLf.png"
                    alt="NDPC Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Protected by NDPC
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
