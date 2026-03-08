"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, FileText, Shield, ScrollText, Headphones, Phone } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

const faqItems = [
  {
    id: 1,
    icon: FileText,
    title: "About Us",
    href: "/help/about",
  },
  {
    id: 2,
    icon: Shield,
    title: "Privacy Policy",
    href: "/help/privacy",
  },
  {
    id: 3,
    icon: ScrollText,
    title: "Terms & Condition",
    href: "/help/terms",
  },
]

const contactItems = [
  {
    id: 1,
    icon: Headphones,
    title: "Customer Services",
    href: "mailto:support@spacebutton.com",
  },
  {
    id: 2,
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    title: "WhatsApp",
    href: "https://wa.me/1234567890",
  },
  {
    id: 3,
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    title: "Twitter",
    href: "https://twitter.com/spacebutton",
  },
  {
    id: 4,
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
    title: "Instagram",
    href: "https://instagram.com/spacebutton",
  },
  {
    id: 5,
    icon: () => (
      <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
        <span className="text-background text-sm font-bold">f</span>
      </div>
    ),
    title: "Facebook",
    href: "https://facebook.com/spacebutton",
  },
]

export default function HelpPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq")

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center pr-10">Help & Support</h1>
      </header>

      <div className="px-4">
        <div className="bg-secondary rounded-full p-1 flex mb-6">
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors ${
              activeTab === "faq" ? "bg-background shadow-sm" : ""
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors ${
              activeTab === "contact" ? "bg-background shadow-sm" : ""
            }`}
          >
            Contact Us
          </button>
        </div>

        {activeTab === "faq" ? (
          <div className="space-y-4">
            {faqItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border"
              >
                <item.icon className="w-6 h-6 text-primary" />
                <span className="font-medium">{item.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {contactItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl border border-border"
              >
                {typeof item.icon === "function" ? (
                  <item.icon />
                ) : (
                  <item.icon className="w-6 h-6" />
                )}
                <span className="font-medium">{item.title}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
