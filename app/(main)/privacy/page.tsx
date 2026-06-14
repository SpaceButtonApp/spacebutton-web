'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">Privacy Policy</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 leading-relaxed">
        <h2 className="mb-4 text-xl font-bold">SPACE BUTTON: Privacy Policy</h2>
        <p className="mb-4">Effective Date: [Insert Date]</p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">1. Introduction</h3>
        <p className="mb-4">
          At SPACE BUTTON, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the &quot;Platform&quot;).
        </p>
        <p className="mb-4">
          SPACE BUTTON operates as a Data Controller under the Nigeria Data Protection Act, 2023 (NDPA). This means we determine the purposes and means of processing your personal data.
        </p>
        <p className="mb-4">
          By using SPACE BUTTON, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use our Platform.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">2. Information We Collect</h3>
        
        <h4 className="mb-2 font-semibold">2.1 Personal Information You Provide</h4>
        <p className="mb-4">When you register, verify your identity, or use our Platform, we may collect:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li><strong>Identity Data:</strong> Full name, date of birth, gender</li>
          <li><strong>Contact Data:</strong> Email address, phone number, residential address</li>
          <li><strong>Verification Data:</strong> Government-issued ID (National ID, Driver&apos;s License, International Passport, Voter&apos;s Card), Bank Verification Number (BVN - optional)</li>
          <li><strong>Profile Data:</strong> Username, password, profile photo, preferences</li>
          <li><strong>Financial Data:</strong> Bank account details (for payouts), transaction history</li>
          <li><strong>Communication Data:</strong> Your messages with other users, inquiries to customer support</li>
        </ul>

        <h4 className="mb-2 font-semibold">2.2 Information Collected Automatically</h4>
        <p className="mb-4">When you use our Platform, we automatically collect:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li><strong>Usage Data:</strong> Pages viewed, time spent, clicks, searches</li>
          <li><strong>Device Data:</strong> IP address, browser type, operating system, device identifiers</li>
          <li><strong>Location Data:</strong> Approximate location derived from IP address</li>
          <li><strong>Cookies & Tracking Technologies:</strong> As described in Section 11</li>
        </ul>

        <h4 className="mb-2 font-semibold">2.3 Information from Third Parties</h4>
        <p className="mb-4">We may receive information from:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>Identity verification services</li>
          <li>Payment processors</li>
          <li>Social media platforms (if you choose to link accounts)</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">3. How We Use Your Information</h3>
        <p className="mb-4">We use your personal data for the following purposes:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>To create and manage your account</li>
          <li>To verify your identity and prevent fraud</li>
          <li>To enable connections between tenants</li>
          <li>To process payments and payouts</li>
          <li>To communicate with you about your account or listings</li>
          <li>To improve our Platform and user experience</li>
          <li>To send marketing communications (with your consent)</li>
          <li>To comply with legal obligations</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">4. Data Sharing</h3>
        <p className="mb-4">We may share your information with:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li><strong>Other Users:</strong> Your profile information, listings, and reviews are visible to other users</li>
          <li><strong>Service Providers:</strong> Payment processors, identity verification services, cloud hosting providers</li>
          <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
          <li><strong>Business Partners:</strong> For joint marketing or services (with your consent)</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">5. Your Rights</h3>
        <p className="mb-4">Under the NDPA, you have the right to:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your data (subject to legal requirements)</li>
          <li>Restrict processing of your data</li>
          <li>Object to processing</li>
          <li>Data portability</li>
          <li>Withdraw consent at any time</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">6. Data Security</h3>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">7. Contact Us</h3>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us at:<br />
          <strong>Email:</strong> [Insert Email]<br />
          <strong>Address:</strong> [Insert Address]
        </p>
      </div>
    </div>
  )
}
