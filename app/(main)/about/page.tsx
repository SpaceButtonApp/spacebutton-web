'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function AboutUsPage() {
  const router = useRouter()

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
        <p className="mb-4">
          SPACE BUTTON is Nigeria&apos;s first peer-to-peer rental platform built by renters, for renters. We connect people who are leaving their apartments with those looking for a new place to call home—directly, without expensive agents.
        </p>
        <p className="mb-4">
          We&apos;re a team of young Nigerians who understand the struggle of finding affordable, trustworthy housing in today&apos;s market. We built SPACE BUTTON to change that.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">What We Do</h3>
        <p className="mb-4">We make renting simple.</p>
        <p className="mb-4">
          Instead of paying costly agent fees, you connect directly with current tenants who are moving out. They show you the real apartment, share their honest experience, and help you secure the space before it ever hits the open market.
        </p>
        <p className="mb-4">We help tenants earn.</p>
        <p className="mb-4">
          When you&apos;re leaving your apartment, you can post it on SPACE BUTTON. If someone secures it through you, you earn 5% of the annual rent—enough to cover your moving costs and stress less.
        </p>
        <p className="mb-4">We build trust.</p>
        <p className="mb-4">
          Every user is verified. Every listing comes from a real person. Every review is from someone who actually lived there.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Our Story</h3>
        <p className="mb-4">SPACE BUTTON started with a simple truth: renting in Nigeria is broken.</p>
        <p className="mb-4">
          Our founder knows this firsthand. In university, he lived 10km from school because no affordable apartment was available near campus. The ones within reach came with agent fees that made them impossible to afford. He watched his grades suffer while commuting, all because of a housing system that failed him.
        </p>
        <p className="mb-4">
          After graduation, the story repeated. Searching for a room and parlor, he found the perfect place—only to discover the agent fees doubled the total cost. With only ₦700k in hand and ₦2 million demanded upfront, that dream apartment slipped away.
        </p>
        <p className="mb-4">
          But here&apos;s the thing: these aren&apos;t just his stories. They&apos;re yours. They&apos;re mine. They&apos;re the reality for millions of Nigerian renters.
        </p>
        <p className="mb-4">Every day on social media, people complain about:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>Agents who collect money and disappear</li>
          <li>Fees that make no sense (10–15% just to say &quot;I found this for you&quot;)</li>
          <li>Losing months of rent when life happens and you have to move unexpectedly</li>
        </ul>
        <p className="mb-4">These problems have become so normal that people have stopped expecting change.</p>
        <p className="mb-4 font-semibold">We haven&apos;t.</p>
        <p className="mb-4">We looked at this mess and asked: What if tenants could help each other instead?</p>
        <p className="mb-4">What if the person leaving an apartment could introduce the person coming in—and both benefit?</p>
        <p className="mb-4">What if the money that goes to agents went back into the pockets of regular people?</p>
        <p className="mb-4">What if finding a home was as simple as pressing a button?</p>
        <p className="mb-4 font-bold">That&apos;s SPACE BUTTON.</p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Our Mission</h3>
        <p className="mb-4">
          To make renting in Nigeria transparent, affordable, and stress-free—by putting power back into the hands of tenants.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Our Vision</h3>
        <p className="mb-4">A Nigeria where:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li>No one loses rent because they had to move unexpectedly</li>
          <li>No one pays an agent more than they pay for a month&apos;s rent</li>
          <li>Every space—apartments, offices, shared living—is just a button away</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Our Values</h3>
        <p className="mb-2 font-semibold">Value What It Means to Us</p>
        <p className="mb-4">
          <strong>Trust First:</strong> Verified users, real reviews, no fake listings
        </p>
        <p className="mb-4">
          <strong>Community Over Commissions:</strong> We put people before profit
        </p>
        <p className="mb-4">
          <strong>Simplicity:</strong> Renting should be easy, not stressful
        </p>
        <p className="mb-4">
          <strong>Empowerment:</strong> Help tenants earn, help renters save
        </p>
        <p className="mb-4">
          <strong>Innovation:</strong> We don&apos;t accept &quot;That&apos;s how it&apos;s always been&quot;
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">What Makes Us Different</h3>
        <p className="mb-4">
          Instead of... We Sell... Paying agent 10–15% Pay a small fee to connect directly. Wondering if listings are real See photos and reviews from current tenants. Losing money when you leave Earn money when you list on SpaceButton. Trusting strangers Verified users, in-app chat, ratings. Accepting the struggle Build a better way.
        </p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">More Than Just Transfers</h3>
        <p className="mb-4">We&apos;re starting with apartment transfers, but SPACE BUTTON is growing into a complete housing ecosystem:</p>
        <ul className="mb-4 ml-4 list-disc">
          <li><strong>Roommate Matching:</strong> Find verified people to share rent with</li>
          <li><strong>Short Lets:</strong> Soon, temporary stays without agency reruns</li>
          <li><strong>Real Estate:</strong> In the future, buy and sell property transparently</li>
          <li><strong>Agent Partnerships:</strong> We work with verified agents too—giving them national reach without the bad reputation</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Join the Movement</h3>
        <p className="mb-4">
          SPACE BUTTON is more than an app. It&apos;s a community of renters helping renters.
        </p>
        <p className="mb-4">
          Whether you&apos;re looking for your next home or leaving the one you love, we&apos;re here to help.
        </p>
        <p className="mb-4 font-semibold">Because your next space is just a button away.</p>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Quick Facts</h3>
        <ul className="mb-4 ml-4 list-disc">
          <li>Founded: 2025</li>
          <li>Headquarters: Lagos, Nigeria</li>
          <li>Built For: Nigerian renters aged 19–45</li>
          <li>Core Feature: Tenant-to-tenant transfers with 5% earnings</li>
          <li>Problem We Solve: Agent fees, rental stress, vacancy loss</li>
        </ul>

        <hr className="my-6" />

        <h3 className="mb-2 font-bold">Let&apos;s Connect</h3>
        <p className="mb-4">Have questions? Feedback? Just want to say hello?</p>
        <ul className="mb-4 ml-4 list-none">
          <li><strong>Email:</strong> [Insert Email]</li>
          <li><strong>Instagram:</strong> @spacebutton</li>
          <li><strong>Twitter/X:</strong> @spacebutton</li>
          <li><strong>Website:</strong> www.spacebutton.ng</li>
        </ul>

        <hr className="my-6" />

        <p className="text-center font-bold">SPACE BUTTON: Rent Smarter. Live Freer.</p>
      </div>
    </div>
  )
}
