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

  const logoUrl = '/icon.png'

  const availableProperties = properties.slice(0, 3)
  
  const testimonials = [
    {
      name: 'Chinedu O.',
      role: 'Tenant',
      rating: 5,
      text: 'Exceptional Service! Our experience with SpaceButton was outstanding. Connecting with property professionals makes finding my dream home a breeze.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Tunde A.',
      role: 'Property Owner',
      rating: 5,
      text: "Got a Maxi flat apartment in 3 days. Without going through agents, it's way easier. The platform saved me time and money!",
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Adrina M.',
      role: 'Real Estate Agent',
      rating: 5,
      text: 'Best platform for reaching serious buyers. My agent got my most quality inquiries here. Highly recommended for professionals!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ]

  const faqs = [
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
        {/* Announcement Banner */}
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>New: Video tours now available for premium listings!</span>
            <button onClick={() => router.push('/get-started')} className="underline font-semibold hover:no-underline ml-1">
              Learn more <ArrowRight className="w-3 h-3 inline" />
            </button>
          </span>
        </div>

        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <Image src={logoUrl} alt="SpaceButton" width={32} height={32} className="h-8 w-8" />
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
                Over 1,000 new listings this week
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
                  Your journey to finding the perfect Space begins here. <span className="text-foreground font-medium">No inspection fees.</span> No stress. Just real connections.
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

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 sm:gap-16 pt-8 border-t border-border mt-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-foreground flex items-center justify-center gap-1">
                      {stat.value}
                      {stat.icon && <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
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

        {/* Featured Properties */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start md:items-center justify-between mb-10 flex-col md:flex-row gap-4">
              <div>
                <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Featured Listings</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Explore Popular Properties</h2>
                <p className="text-muted-foreground max-w-xl">Handpicked selection of exceptional homes and investments available through SpaceButton.</p>
              </div>
              <button
                onClick={() => router.push('/get-started')}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold whitespace-nowrap group"
              >
                View All Properties 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProperties.map((property) => (
                <button
                  key={property.id}
                  onClick={() => router.push('/get-started')}
                  className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl text-left"
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-lg">
                      Featured
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white rounded-lg px-2 py-1 backdrop-blur-sm text-xs">
                      <Grid3X3 className="w-3 h-3" />
                      {property.photoCount}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-foreground line-clamp-1">{property.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-3 text-sm">
                      <MapPin className="w-4 h-4" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                      <span className="capitalize bg-secondary px-2 py-1 rounded">{property.propertyCategory || property.category}</span>
                      {property.beds && <span>{property.beds} Bed</span>}
                      {property.baths && <span>{property.baths} Bath</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-bold text-xl">
                        ₦{property.price?.toLocaleString() || 'N/A'}
                        <span className="text-sm font-normal text-muted-foreground">{property.rentPeriod ? `/${property.rentPeriod}` : ''}</span>
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-20 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Testimonials</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Join thousands of satisfied users who found their perfect space through SpaceButton.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="bg-background rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">&quot;{testimonial.text}&quot;</p>
                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                    </div>
                  </div>
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
                  <Image src={logoUrl} alt="SpaceButton" width={32} height={32} className="h-8 w-8" />
                  <span className="font-bold text-foreground">SpaceButton</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Finding your dream space, made easy. No inspection fees, just real connections.</p>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
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
            <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2026 SpaceButton. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Terms</button>
                <button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Privacy</button>
                <button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Cookies</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
