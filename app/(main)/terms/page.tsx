'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function TermsPage() {
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
        <h1 className="flex-1 text-center text-lg font-semibold">Terms & Conditions</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 leading-relaxed">
        <h2 className="mb-4 text-xl font-bold">SPACE BUTTON: Terms and Conditions</h2>
        <p className="mb-4">Effective Date: [Insert Date]</p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">1. Acceptance of Terms</h3>
        <p className="mb-4">
          Welcome to SPACE BUTTON. By downloading, accessing, or using our mobile application and website (collectively, the &quot;Platform&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Platform.
        </p>
        <p className="mb-4">
          SPACE BUTTON is operated by [Insert Company Name], registered in Nigeria. These Terms constitute a legally binding agreement between you and SPACE BUTTON.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">2. Eligibility</h3>
        <p className="mb-4">By using SPACE BUTTON, you represent and warrant that:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>You are at least 18 years of age</li>
          <li>You have the legal capacity to enter into a binding agreement</li>
          <li>You are not located in a country subject to sanctions or embargoes</li>
          <li>You will provide accurate, current, and complete information during registration</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">3. Account Registration</h3>
        
        <h4 className="mb-2 font-semibold">3.1 Account Creation</h4>
        <p className="mb-4">To use certain features of the Platform, you must create an account. You agree to:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>Provide accurate and truthful information</li>
          <li>Keep your login credentials secure</li>
          <li>Not share your account with others</li>
          <li>Not create multiple accounts</li>
        </ul>

        <h4 className="mb-2 font-semibold">3.2 Verification</h4>
        <p className="mb-4">
          SPACE BUTTON may require identity verification to enhance trust and safety. You agree to provide such information as reasonably requested for verification purposes.
        </p>

        <h4 className="mb-2 font-semibold">3.3 Account Suspension</h4>
        <p className="mb-4">
          We reserve the right to suspend or terminate your account if we suspect fraudulent, abusive, or illegal activity, or violation of these Terms.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">4. Platform Services</h3>
        <p className="mb-4">SPACE BUTTON provides a peer-to-peer platform that enables:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>Tenants to list apartments they will soon vacate</li>
          <li>Prospective tenants to connect with current tenants</li>
          <li>Roommate matching</li>
          <li>Verified agent listings (where applicable)</li>
        </ul>
        <p className="mb-4 font-semibold">
          SPACE BUTTON IS A TECHNOLOGY PLATFORM AND DOES NOT TAKE PART IN ANY RENTAL TRANSACTIONS BETWEEN USERS. We facilitate connections but are not a party to any rental agreements.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">5. User Conduct</h3>
        <p className="mb-4">You agree NOT to:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>Post false, misleading, or fraudulent listings</li>
          <li>Harass, threaten, or abuse other users</li>
          <li>Use the Platform for illegal activities</li>
          <li>Circumvent fees or platform rules</li>
          <li>Scrape data or use bots on the Platform</li>
          <li>Impersonate another person or entity</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">6. Listings</h3>
        <p className="mb-4">When creating a listing, you agree that:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>All information is accurate and complete</li>
          <li>You have the right to list the property</li>
          <li>Photos and descriptions represent the actual property</li>
          <li>You will respond to inquiries in a timely manner</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">7. Fees and Payments</h3>
        <p className="mb-4">
          SPACE BUTTON charges fees for certain services. All fees are non-refundable unless otherwise stated. We use third-party payment processors and are not responsible for their services.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">8. Limitation of Liability</h3>
        <p className="mb-4">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPACE BUTTON SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">9. Dispute Resolution</h3>
        <p className="mb-4">
          Any disputes arising from these Terms shall be resolved through negotiation, mediation, and if necessary, binding arbitration in accordance with Nigerian law.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">10. Changes to Terms</h3>
        <p className="mb-4">
          We may update these Terms from time to time. We will notify you of material changes through the Platform or via email. Continued use of the Platform after changes constitutes acceptance of the new Terms.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">11. Contact Us</h3>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at:<br />
          <strong>Email:</strong> [Insert Email]<br />
          <strong>Address:</strong> [Insert Address]
        </p>
      </div>
    </div>
  )
}
