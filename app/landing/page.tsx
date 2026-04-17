'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Shield, 
  MessageSquare, 
  Zap, 
  Star, 
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  const features = [
    {
      icon: Building2,
      title: 'Find Your Perfect Space',
      description: 'Browse thousands of verified apartments, houses, and rooms from trusted landlords and agents.'
    },
    {
      icon: Users,
      title: 'Connect Directly',
      description: 'Chat directly with property owners and agents. No middlemen, transparent communication.'
    },
    {
      icon: Shield,
      title: 'Safe & Verified',
      description: 'All listings and users are verified. Secure payments and buyer protection guarantee.'
    },
    {
      icon: MessageSquare,
      title: 'Instant Messaging',
      description: 'Real-time chat with landlords and agents. Ask questions, negotiate, and close deals.'
    },
    {
      icon: Zap,
      title: 'Quick Process',
      description: 'From listing to deal in days. Streamlined documentation and fast approval.'
    },
    {
      icon: Star,
      title: 'Rated & Reviewed',
      description: 'See verified reviews from real users. Make informed decisions with community feedback.'
    }
  ]

  const testimonials = [
    {
      name: 'Chinedu O.',
      role: 'First-time Home Buyer',
      content: 'Found my dream apartment in just 2 weeks. The platform made the entire process so simple!',
      rating: 5
    },
    {
      name: 'Aisha M.',
      role: 'Property Agent',
      content: 'Best platform for reaching serious buyers. My properties get way more quality inquiries here.',
      rating: 5
    },
    {
      name: 'Tunde A.',
      role: 'Landlord',
      content: 'The verification system gives me confidence. I only rent to vetted tenants now.',
      rating: 5
    }
  ]

  const benefits = [
    'No hidden fees',
    'Instant notifications',
    'Mobile-optimized',
    'Secure payments',
    'Live chat support',
    'Premium verification'
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="text-xl font-bold">SpaceButton</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="rounded-xl"
            >
              Sign In
            </Button>
            <Button
              onClick={() => router.push('/signup')}
              className="rounded-xl bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Welcome to the Future of Real Estate</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                Find Your Perfect Space
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-balance">
                Connect directly with property owners and agents. Safe, verified, and transparent. Your next home is just a few clicks away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push('/signup')}
                  size="lg"
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 text-base h-14"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  size="lg"
                  className="rounded-xl text-base h-14"
                >
                  Explore Listings
                </Button>
              </div>
              <div className="flex gap-8 mt-8 pt-8 border-t border-border">
                {[
                  { label: 'Active Users', value: '10K+' },
                  { label: 'Properties', value: '50K+' },
                  { label: 'Successful Deals', value: '5K+' }
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-96 md:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-border p-8 flex items-center justify-center h-full">
                <div className="text-center">
                  <Building2 className="w-24 h-24 text-primary/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">Browse thousands of verified properties</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-secondary/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose SpaceButton?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to find, list, and manage properties in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-secondary/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Our Community</h2>
            <p className="text-xl text-muted-foreground">Real reviews from real users</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Find Your Perfect Space?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users finding their next home on SpaceButton.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/signup')}
              size="lg"
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 text-base h-14 px-8"
            >
              Sign Up Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              size="lg"
              className="rounded-xl text-base h-14 px-8"
            >
              Browse Listings
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">S</span>
                </div>
                <span className="font-bold">SpaceButton</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The simplest way to find, list, and manage properties.
              </p>
            </div>
            {[
              {
                title: 'Product',
                links: ['Find Properties', 'List Property', 'Pricing', 'Features']
              },
              {
                title: 'Company',
                links: ['About Us', 'Blog', 'Careers', 'Contact']
              },
              {
                title: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Safety']
              }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 SpaceButton. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Facebook</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
