'use client'

import { ChevronLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-4">
        <button
          onClick={() => window.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">Privacy Policy</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 leading-relaxed">
        <h2 className="mb-4 text-xl font-bold">SPACE BUTTON: Privacy Policy</h2>
        <p className="mb-4 text-muted-foreground">Effective Date: 29/06/2026</p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">1. Introduction</h3>
        <p className="mb-4 text-muted-foreground">
          At SPACE BUTTON, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">2. Information We Collect</h3>
        <p className="mb-4 text-muted-foreground">
          We may collect: Identity Data (name, date of birth), Contact Data (email, phone, address), Verification Data (government-issued ID), Profile Data (username, password, preferences), Financial Data (bank details for payouts), Communication Data (messages, support inquiries).
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">3. How We Use Your Information</h3>
        <p className="mb-4 text-muted-foreground">
          We use your personal data to: create and manage your account, verify your identity and prevent fraud, enable connections between tenants, process payments, communicate with you, improve our Platform, and comply with legal obligations.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">4. Data Sharing</h3>
        <p className="mb-4 text-muted-foreground">
          We may share your information with other users (profile, listings, reviews), service providers (payment processors, cloud hosting), legal authorities (when required by law), and business partners (with your consent).
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">5. Your Rights</h3>
        <p className="mb-4 text-muted-foreground">
          Under the NDPA, you have the right to: access your personal data, correct inaccurate data, delete your data, restrict processing, object to processing, data portability, and withdraw consent at any time.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">6. Data Security</h3>
        <p className="mb-4 text-muted-foreground">
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">7. Contact Us</h3>
        <p className="mb-4 text-muted-foreground">
          If you have any questions about this Privacy Policy, please contact us at:<br />
          <strong className="text-foreground">Email:</strong> info@spacebutton.net<br />
          <strong className="text-foreground">Address:</strong> Lagos, Nigeria
        </p>
      </div>
    </div>
  )
}
