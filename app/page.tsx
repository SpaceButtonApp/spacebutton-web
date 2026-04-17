'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sun, Moon, Monitor, ChevronLeft, ChevronRight, MapPin, Home, DollarSign, Grid3X3, Star, Users, Search, Heart, Zap, Shield, TrendingUp, Clock } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn, formatPrice } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'

export default function LandingPage() {
  const router = useRouter()
  const { properties } = useAppStore()
  const [theme, setTheme] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      setTheme(saved)
    } else {
      setTheme('system')
    }
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
  const heroImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/landing%20page.png-Fvd0I98VIhY6V1kmJvVe8GEAUYVqjp.jpeg'

  const availableProperties = properties.slice(0, 3)
  const testimonials = [
    {
      name: 'Chinedu O.',
      role: 'Individual',
      rating: 5,
      text: 'Exceptional Service! Our experience with SpaceButton was outstanding. Connecting with property professionals makes finding my dream home a breeze. Highly recommended!'
    },
    {
      name: 'Tunde A.',
      role: 'Individual',
      rating: 5,
      text: 'Efficient and Reliable. Got a Maxi flat apartment in 3 days. Without going through agents, it's way easier. Highly Recommended.'
    },
    {
      name: 'Adrina M.',
      role: 'Agent',
      rating: 5,
      text: 'Trusted Advisors. Best platform for reaching serious buyers. My agent got my most quality inquiries here.'
    }
  ]

  const faqs = [
    {
      q: 'How do I search for Spaces on SpaceButton?',
      a: 'Learn How to use our user-friendly search tools to find properties that match your criteria'
    },
    {
      q: 'What documents do I need to list my Space through SpaceButton?',
      a: 'Find out about the necessary documentation needed for listing your property with us.'
    },
    {
      q: 'How can I contact an Estellen agent?',
      a: 'Discover the different ways you can get in touch with our experienced agents.'
    }
  ]

  return (
    <div className={cn(isDark ? 'dark' : 'light')}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <Image src={logoUrl} alt="SpaceButton" width={32} height={32} className="h-8 w-8" />
              <span className="font-bold text-base sm:text-lg text-foreground hidden sm:inline">SpaceButton</span>
            </Link>

            {/* Center Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => router.push('/get-started')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</button>
              <button onClick={() => router.push('/get-started')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</button>
              <button onClick={() => router.push('/get-started')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Properties</button>
              <button onClick={() => router.push('/get-started')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</button>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle */}
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

              {/* Auth Buttons */}
              <button
                onClick={() => router.push('/login')}
                className="hidden sm:block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-foreground hover:bg-secondary transition-colors text-xs sm:text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/sign-up')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground">
                    Find Your Dream Space<br />
                    <span className="text-primary">with SpaceButton</span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-3 sm:mt-4 md:mt-6 leading-relaxed">
                    Your journey to finding the perfect space begins here. Your Next Home is Already Waiting. No inspections from the street, Let good spaces with people ready to move in. Best of all, meet property owners directly - Stress-free apartment hunting.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <button
                    onClick={() => router.push('/get-started')}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:shadow-lg text-sm sm:text-base"
                  >
                    Learn More
                  </button>
                  <button
                    onClick={() => router.push('/get-started')}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-all text-sm sm:text-base"
                  >
                    Browse Home
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-3 sm:pt-6 md:pt-8">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">20k+</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Happy Users</p>
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">100k+</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Listed Homes</p>
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">16+</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Years of Experience</p>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative h-48 sm:h-72 md:h-96 lg:h-full min-h-[300px] md:min-h-[400px]">
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

        {/* Search Section */}
        <section className="py-6 sm:py-8 md:py-12 bg-card/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Search for Available Space</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 bg-background rounded-full px-3 sm:px-4 py-2 sm:py-3 border border-border">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Location" className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 bg-background rounded-full px-3 sm:px-4 py-2 sm:py-3 border border-border">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Home Type" className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 bg-background rounded-full px-3 sm:px-4 py-2 sm:py-3 border border-border">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Budget" className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
                </div>
                <button
                  onClick={() => router.push('/get-started')}
                  className="bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors text-sm sm:text-base col-span-2 sm:col-span-1"
                >
                  Search Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start md:items-center justify-between mb-6 sm:mb-8 md:mb-12 flex-col md:flex-row gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Featured Properties</h2>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Explore our handpicked selection of featured properties. Each listing offers a glimpse into exceptional homes and investments available through SpaceButton. Click View Details to uncover more information.</p>
              </div>
              <button
                onClick={() => router.push('/get-started')}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm md:text-base whitespace-nowrap"
              >
                View All Properties <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {availableProperties.map((property) => (
                <button
                  key={property.id}
                  onClick={() => router.push(`/property/${property.id}`)}
                  className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl text-left"
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white rounded-lg px-2 py-1 backdrop-blur-sm text-xs sm:text-sm">
                      <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      {property.photoCount}
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base">{property.title}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground mb-3 md:mb-4 text-xs sm:text-sm">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-3 mb-3 md:mb-4 text-xs text-muted-foreground flex-wrap">
                      <span className="capitalize">{property.category}</span>
                      {property.bedrooms && <span>{property.bedrooms} Bed</span>}
                      {property.bathrooms && <span>{property.bathrooms} Bath</span>}
                    </div>
                    <p className="text-primary font-bold text-base sm:text-lg md:text-xl">{formatPrice(property.price, property.rentPeriod)}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/property/${property.id}`)
                      }}
                      className="w-full mt-3 md:mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2 font-semibold transition-colors text-sm"
                    >
                      View Property Details
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-8 sm:py-12 md:py-16 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">What Our Users Say</h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl mx-auto">Read the success stories and heartfelt testimonials from our valued users. Discover why they chose SpaceButton for their space needs.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="p-4 md:p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-1 mb-3 md:mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-base mb-3 md:mb-4">{testimonial.text}</p>
                  <div className="border-t border-border pt-3 md:pt-4">
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Find answers to common questions about SpaceButton, how our service works, and more. If you can't find what you're looking for, please contact our support team.</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 md:p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{faq.q}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">{faq.a}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-12 md:py-16 bg-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6">
              Discover Vacant Spaces Today using SpaceButton
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto">
              Your dream space is just a click away. Whether you're looking for a cozy apartment, a spacious home, or a commercial property, SpaceButton helps you find exactly what you're looking for.
            </p>
            <button
              onClick={() => router.push('/get-started')}
              className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:shadow-lg text-sm sm:text-base"
            >
              Explore Properties
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Image src={logoUrl} alt="SpaceButton" width={32} height={32} className="h-8 w-8" />
                  <span className="font-bold text-foreground">SpaceButton</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">Finding your dream space, made easy.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 md:mb-3 text-xs sm:text-sm">Home Section</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Popular Listing</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Our Story</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Testimonials</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 md:mb-3 text-xs sm:text-sm">Properties</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">FAQs</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">How it Works</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Technotools</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 md:mb-3 text-xs sm:text-sm">Services</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Categories</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Strategic Marketing</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Migration Strategy</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 md:mb-3 text-xs sm:text-sm">Contact Us</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Contact Forms</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Chasing Success</button></li>
                  <li><button onClick={() => router.push('/get-started')} className="hover:text-foreground transition-colors">Our Offices</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-4 sm:pt-6 md:pt-8">
              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                © 2026 SpaceButton. All rights reserved. | Terms & Conditions
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
