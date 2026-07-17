'use client'

import { ChevronLeft } from 'lucide-react'

export default function TermsPage() {

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-4">
        <button
          onClick={() => window.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">Terms & Conditions</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 leading-relaxed">
        <h2 className="mb-4 text-xl font-bold">SPACE BUTTON: Terms and Conditions</h2>
        <p className="mb-4 text-muted-foreground">Effective Date: 29/06/2026</p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">1. Acceptance of Terms</h3>
        <p className="mb-4 text-muted-foreground">
          Welcome to SPACE BUTTON. By downloading, accessing, or using our mobile application and website, you agree to be bound by these Terms and Conditions. If you do not agree to these Terms, please do not use the Platform.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">2. Eligibility</h3>
        <p className="mb-4 text-muted-foreground">
          By using SPACE BUTTON, you represent that you are at least 18 years of age, have the legal capacity to enter into a binding agreement, and will provide accurate, current, and complete information during registration.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">3. Account Registration</h3>
        <p className="mb-4 text-muted-foreground">
          To use certain features, you must create an account. You agree to provide accurate information, keep your login credentials secure, not share your account with others, and not create multiple accounts. SPACE BUTTON may require identity verification to enhance trust and safety.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">4. Platform Services</h3>
        <p className="mb-4 text-muted-foreground">
          SPACE BUTTON provides a peer-to-peer platform that enables tenants to list apartments they will soon vacate, prospective tenants to connect with current tenants, roommate matching, and verified agent listings.
        </p>
        <p className="mb-4 font-semibold">
          SPACE BUTTON IS A TECHNOLOGY PLATFORM AND DOES NOT TAKE PART IN ANY RENTAL TRANSACTIONS BETWEEN USERS.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">5. User Conduct</h3>
        <p className="mb-4 text-muted-foreground">
          You agree NOT to post false, misleading, or fraudulent listings, harass or abuse other users, use the Platform for illegal activities, circumvent fees or platform rules, scrape data or use bots, or impersonate another person or entity.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">6. Listings</h3>
        <p className="mb-4 text-muted-foreground">
          When creating a listing, you agree that all information is accurate and complete, you have the right to list the property, photos and descriptions represent the actual property, and you will respond to inquiries in a timely manner.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">7. Fees and Payments</h3>
        <p className="mb-4 text-muted-foreground">
          SPACE BUTTON charges fees for certain services. All fees are non-refundable unless otherwise stated. We use third-party payment processors and are not responsible for their services.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">8. Limitation of Liability</h3>
        <p className="mb-4 text-muted-foreground">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPACE BUTTON SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">9. Dispute Resolution</h3>
        <p className="mb-4 text-muted-foreground">
          Any disputes arising from these Terms shall be resolved through negotiation, mediation, and if necessary, binding arbitration in accordance with Nigerian law.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">10. Changes to Terms</h3>
        <p className="mb-4 text-muted-foreground">
          We may update these Terms from time to time. We will notify you of material changes through the Platform or via email. Continued use of the Platform after changes constitutes acceptance of the new Terms.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">11. Contact Us</h3>
        <p className="mb-4 text-muted-foreground">
          If you have any questions about these Terms, please contact us at:<br />
          <strong className="text-foreground">Email:</strong> info@spacebutton.net<br />
          <strong className="text-foreground">Address:</strong> Lagos, Nigeria
        </p>
      </div>
    </div>
  )
}
