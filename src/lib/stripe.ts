import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLANS = {
  STARTER: {
    name: 'Starter',
    description: 'Perfect for individuals starting out',
    price: 99,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    features: [
      'Access to 500 surplus cases/month',
      'Basic owner contact info',
      'Email alerts',
      'CSV export',
      'County directory access',
    ],
    limits: { cases: 500, leads: 50, exports: 10 },
  },
  PROFESSIONAL: {
    name: 'Professional',
    description: 'For serious recovery agents',
    price: 299,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    features: [
      'Unlimited surplus cases',
      'Full owner enrichment (phone, email, aliases)',
      'AI skip tracing',
      'SMS/Email outreach',
      'CRM system',
      'Lead marketplace access',
      'Advanced analytics',
      'Bulk export',
    ],
    limits: { cases: -1, leads: 500, exports: -1 },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'For law firms and large operations',
    price: 999,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    features: [
      'Everything in Professional',
      'API access',
      'White-label option',
      'Recovery commission tracking',
      'Attorney referral network',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    limits: { cases: -1, leads: -1, exports: -1 },
  },
}
