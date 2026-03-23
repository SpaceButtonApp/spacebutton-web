'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Basic Single',
    price: '₦500',
    period: '/connect',
    description: 'Perfect for trying out SpaceButton',
    features: [
      '1 Connect credit',
      'Access to all listings',
      'Basic chat support',
      'Valid for 30 days',
    ],
    popular: false,
  },
  {
    name: 'Basic 5-Pack',
    price: '₦2,000',
    period: '/5 connects',
    description: 'Great value for regular users',
    features: [
      '5 Connect credits',
      'Access to all listings',
      'Priority chat support',
      'Valid for 60 days',
      '20% savings',
    ],
    popular: false,
  },
  {
    name: 'Premium Monthly',
    price: '₦5,000',
    period: '/month',
    description: 'Unlimited access for serious searchers',
    features: [
      'Unlimited connects',
      'Access to all listings',
      'Priority support 24/7',
      'Verified badge',
      'Featured profile',
      'Early access to new listings',
    ],
    popular: true,
  },
  {
    name: 'Premium Yearly',
    price: '₦48,000',
    period: '/year',
    description: 'Best value - save 20%',
    features: [
      'Everything in Monthly',
      'Unlimited connects',
      '2 months free',
      'Exclusive deals',
      'Personal account manager',
      'Analytics dashboard',
    ],
    popular: false,
  },
]

export default function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Manage and view all subscription plans available to users
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`bg-card rounded-2xl p-6 border-2 transition-all ${
              plan.popular 
                ? 'border-primary shadow-lg shadow-primary/10' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            {plan.popular && (
              <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full mb-4">
                Most Popular
              </span>
            )}

            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

            <div className="mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className={`w-full ${
                plan.popular 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {plan.popular ? 'Current Active' : 'Edit Plan'}
            </Button>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="bg-card rounded-2xl p-6 border border-border text-center">
          <p className="text-3xl font-bold text-primary">12,450</p>
          <p className="text-sm text-muted-foreground">Total Subscribers</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border text-center">
          <p className="text-3xl font-bold text-green-500">8,230</p>
          <p className="text-sm text-muted-foreground">Premium Users</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border text-center">
          <p className="text-3xl font-bold text-amber-500">₦15.2M</p>
          <p className="text-sm text-muted-foreground">Monthly Revenue</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border text-center">
          <p className="text-3xl font-bold text-blue-500">94%</p>
          <p className="text-sm text-muted-foreground">Renewal Rate</p>
        </div>
      </div>
    </div>
  )
}
