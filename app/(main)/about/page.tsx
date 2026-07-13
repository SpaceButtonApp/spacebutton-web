'use client'

import { ChevronLeft } from 'lucide-react'

export default function AboutUsPage() {

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-4">
        <button
          onClick={() => window.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">About Us</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 leading-relaxed">
        <h2 className="mb-4 text-xl font-bold">Welcome to SPACE BUTTON</h2>
        <p className="mb-4">Your next home is just a button away.</p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Who We Are</h3>
        <p className="mb-4 text-muted-foreground">
          SPACE BUTTON is Nigeria&apos;s first peer-to-peer rental platform built by renters, for renters. We connect people who are leaving their apartments with those looking for a new place to call home—directly, without expensive agents.
        </p>
        <p className="mb-4 text-muted-foreground">
          We&apos;re a team of young Nigerians who understand the struggle of finding affordable, trustworthy housing in today&apos;s market. We built SPACE BUTTON to change that.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Our Mission</h3>
        <p className="mb-4 text-muted-foreground">
          To make renting in Nigeria transparent, affordable, and stress-free—by putting power back into the hands of tenants.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Our Vision</h3>
        <p className="mb-4 text-muted-foreground">A Nigeria where:</p>
        <ul className="mb-4 ml-4 list-disc text-muted-foreground">
          <li>No one loses rent because they had to move unexpectedly</li>
          <li>No one pays an agent more than they pay for a month&apos;s rent</li>
          <li>Every space is just a button away</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Our Values</h3>
        <p className="mb-2 text-muted-foreground"><strong className="text-foreground">Trust First:</strong> Verified users, real reviews, no fake listings</p>
        <p className="mb-2 text-muted-foreground"><strong className="text-foreground">Community Over Commissions:</strong> We put people before profit</p>
        <p className="mb-2 text-muted-foreground"><strong className="text-foreground">Simplicity:</strong> Renting should be easy, not stressful</p>
        <p className="mb-2 text-muted-foreground"><strong className="text-foreground">Empowerment:</strong> Help tenants earn, help renters save</p>
        <p className="mb-4 text-muted-foreground"><strong className="text-foreground">Innovation:</strong> We don&apos;t accept &quot;That&apos;s how it&apos;s always been&quot;</p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Quick Facts</h3>
        <p className="mb-1 text-muted-foreground">Founded: 2025</p>
        <p className="mb-1 text-muted-foreground">Headquarters: Lagos, Nigeria</p>
        <p className="mb-1 text-muted-foreground">Built For: Nigerian renters aged 19–45</p>
        <p className="mb-1 text-muted-foreground">Core Feature: Tenant-to-tenant transfers with 5% earnings</p>
        <p className="mb-4 text-muted-foreground">Problem We Solve: Agent fees, rental stress, vacancy loss</p>

        <hr className="my-6" />

        <p className="text-center font-bold">SPACE BUTTON: Find your space. Live freely.</p>
      </div>
    </div>
  )
}
