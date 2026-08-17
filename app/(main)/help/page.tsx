"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Shield, ScrollText, Headphones, Mail, ChevronDown, ChevronRight, HelpCircle } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { BackButton } from "@/components/back-button"

const documentItems = [
  {
    id: 1,
    icon: FileText,
    title: "About Us",
    href: "/about",
  },
  {
    id: 2,
    icon: Shield,
    title: "Privacy Policy",
    href: "/privacy",
  },
  {
    id: 3,
    icon: ScrollText,
    title: "Terms & Condition",
    href: "/terms",
  },
]

const faqItems = [
  {
    id: 1,
    question: "How do I post a property listing?",
    answer: "Navigate to the home screen and tap the '+' button to create a new listing. Fill in the property details including location, price, amenities, and upload clear photos of your space. Your listing will be reviewed and published within 24 hours."
  },
  {
    id: 2,
    question: "What are Connects and how do they work?",
    answer: "Connects are tokens that allow you to contact property owners or interested tenants. Each time you initiate contact with someone, one Connect is used. You can purchase more Connects or upgrade to Premium for unlimited connections."
  },
  {
    id: 3,
    question: "How do I upgrade to Premium?",
    answer: "Go to Settings > Premium to view available subscription plans. Premium members enjoy unlimited connects, priority listing visibility, and verified badge on their profile."
  },
  {
    id: 4,
    question: "Is my personal information secure?",
    answer: "Yes, we use industry-standard encryption to protect your data. Your personal contact information is never shared without your explicit consent. You can control your privacy settings in your profile."
  },
  {
    id: 5,
    question: "How do I save properties I'm interested in?",
    answer: "Simply tap the heart icon on any property listing to save it to your favorites. You can access all your saved properties from the Favorites tab in your profile."
  },
  {
    id: 6,
    question: "What should I do if I encounter a suspicious listing?",
    answer: "If you find a listing that seems fraudulent or suspicious, tap the three dots menu on the listing and select 'Report'. Our team will review it promptly. Never send money without verifying the property in person."
  },
  {
    id: 7,
    question: "How can I edit or delete my listing?",
    answer: "Go to your profile and tap on 'My Listings'. Select the property you want to modify, then use the edit or delete options. Changes may take a few hours to reflect across the platform."
  },
  {
    id: 8,
    question: "What payment methods are accepted?",
    answer: "We accept bank transfers, debit/credit cards, and mobile payment options. All transactions are processed securely through our payment partners."
  },
  {
    id: 9,
    question: "What is the Done Deal button and why is it required?",
    answer: "The Done Deal button is how both parties confirm that a property transaction has been completed. When you tap Done Deal, the other party is notified. Once BOTH parties tap Done Deal, the chat is locked, the listing is marked as closed, and you can leave feedback for each other. It protects both parties by creating a mutual confirmation record of the agreement."
  },
]

type ContactItem = {
  id: number
  icon: React.ElementType
  title: string
  action: string
  href: string
}

const contactItems: ContactItem[] = [
  {
    id: 1,
    icon: Headphones,
    title: "Customer Services",
    action: "chat",
    href: "/chat/admin-support",
  },
  {
    id: 2,
    icon: Mail,
    title: "Mail",
    action: "email",
    href: "mailto:info@spacebutton.net",
  },
  {
    id: 3,
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    title: "WhatsApp",
    action: "link",
    href: "https://wa.me/+2349034466046",
  },
  {
    id: 4,
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    title: "X (Twitter)",
    action: "link",
    href: "https://x.com/spacebutton_net?s=21",
  },
  {
    id: 5,
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
    title: "Instagram",
    action: "link",
    href: "https://www.instagram.com/spacebutton_net?igsh=MTlmaGV5NXYxbmZjdA%3D%3D&utm_source=qr",
  },
  {
    id: 6,
    icon: () => (
      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
        <span className="text-primary-foreground text-sm font-bold">f</span>
      </div>
    ),
    title: "Facebook",
    action: "link",
    href: "https://www.facebook.com/SpaceButton/",
  },
  {
    id: 7,
    icon: ({ className }: { className?: string }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/icons/tiktok.png" alt="TikTok" className={`${className ?? ''} dark:invert`} />
    ),
    title: "TikTok",
    action: "link",
    href: "https://www.tiktok.com/@spacebutton.net?_r=1&_t=ZS-97DJIIiVnui",
  },
  {
    id: 8,
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
    title: "LinkedIn",
    action: "link",
    href: "https://www.linkedin.com/in/space-button-ab9551413",
  },
]

export default function HelpPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"faq" | "contact" | "docs">("faq")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [emailCopied, setEmailCopied] = useState(false)

  const handleContactClick = (item: ContactItem) => {
    if (item.action === 'chat') {
      router.push(item.href)
    } else if (item.action === 'email') {
      window.location.href = item.href
      const address = item.href.replace('mailto:', '')
      navigator.clipboard.writeText(address).then(() => {
        setEmailCopied(true)
        setTimeout(() => setEmailCopied(false), 3000)
      }).catch(() => {})
    } else {
      window.open(item.href, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl px-4 py-4 flex items-center gap-4 border-b border-border">
        <BackButton fallbackUrl="/settings" />
        <h1 className="text-lg font-semibold text-foreground flex-1 text-center pr-10">Help & Support</h1>
      </header>

      <div className="px-4 pt-6">
        {/* Tab Switcher */}
        <div className="bg-secondary rounded-full p-1 flex mb-6 border border-border">
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === "faq" 
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === "docs" 
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === "contact" 
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Contact
          </button>
        </div>

        {activeTab === "faq" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Frequently Asked Questions</h2>
            </div>
            {faqItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground text-sm">{item.question}</span>
                  {expandedFaq === item.id ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                {expandedFaq === item.id && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {item.answer}
                  </p>
                )}
              </button>
            ))}
          </div>
        ) : activeTab === "docs" ? (
          <div className="space-y-3">
            {documentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">{item.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {contactItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleContactClick(item)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  {(() => { const I = item.icon as React.ComponentType<{ className?: string }>; return <I className="w-5 h-5" /> })()}
                </div>
                <span className="font-medium text-foreground">{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {emailCopied && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
          Email address copied to clipboard!
        </div>
      )}

      <BottomNav />
    </div>
  )
}
