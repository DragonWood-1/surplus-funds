import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import { CheckCircle, X, Zap, Users, Building2 } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    price: 99,
    description: 'Perfect for individuals starting a surplus recovery operation',
    icon: Zap,
    features: [
      { text: '500 surplus cases per month', included: true },
      { text: 'Basic owner contact info', included: true },
      { text: 'Email surplus alerts', included: true },
      { text: 'CSV / Excel export', included: true },
      { text: 'County directory access', included: true },
      { text: 'AI skip tracing', included: false },
      { text: 'SMS/Email outreach', included: false },
      { text: 'CRM system', included: false },
      { text: 'Lead marketplace', included: false },
      { text: 'Recovery commission tracking', included: false },
    ],
  },
  {
    name: 'Professional',
    price: 299,
    description: 'For serious recovery agents and small law firms',
    icon: Users,
    popular: true,
    features: [
      { text: 'Unlimited surplus cases', included: true },
      { text: 'Full owner enrichment (phone, email, aliases)', included: true },
      { text: 'AI skip tracing engine', included: true },
      { text: 'SMS/Email/Voicemail outreach', included: true },
      { text: 'Full CRM system', included: true },
      { text: 'Lead marketplace access', included: true },
      { text: 'Advanced analytics dashboard', included: true },
      { text: 'Bulk export (CSV/Excel)', included: true },
      { text: 'Recovery commission tracking', included: true },
      { text: 'API access', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 999,
    description: 'For law firms, large operations, and institutional recovery teams',
    icon: Building2,
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'Full REST API access', included: true },
      { text: 'White-label option', included: true },
      { text: 'Attorney referral network', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom data integrations', included: true },
      { text: 'SLA guarantee (99.9% uptime)', included: true },
      { text: 'Team seats (unlimited)', included: true },
      { text: 'Compliance & legal review', included: true },
      { text: 'On-boarding & training', included: true },
    ],
  },
]

const FAQ = [
  { q: 'How is the surplus data sourced?', a: 'We aggregate data from public records including county tax commissioner websites, court records, sheriff sale notices, and tax deed sale filings across 3,200+ counties nationwide.' },
  { q: 'What is a recovery commission?', a: 'When you recover surplus funds on behalf of a property owner (through your agreement with them), you earn a percentage — typically 20–35%. Our platform tracks these deals and calculates your commission automatically.' },
  { q: 'Is this legal?', a: 'Surplus fund recovery is a legal and common practice. Many attorneys and licensed agents specialize in this field. We provide data and tools — you are responsible for compliance with state-specific laws.' },
  { q: 'Can I cancel anytime?', a: 'Yes. All plans are month-to-month with no long-term contracts. Cancel at any time from your account settings.' },
  { q: 'Do you offer a free trial?', a: 'Yes — all new accounts get a 14-day free trial with full Professional-tier access. No credit card required.' },
]

export const metadata = { title: 'Pricing – SurplusFlow' }

export default function PricingPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-brand-950 to-brand-800 text-white px-4 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-brand-200 text-lg max-w-xl mx-auto mb-6">Start free for 14 days. No credit card required.</p>
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-brand-200">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> No credit card · Cancel anytime
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`card relative flex flex-col ${plan.popular ? 'border-brand-500 ring-2 ring-brand-500 md:scale-[1.02]' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-gray-900">${plan.price}</span>
                    <span className="text-gray-400 text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5">
                      {f.included ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> : <X className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />}
                      <span className={`text-sm ${f.included ? 'text-gray-700' : 'text-gray-400'}`}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`w-full text-center py-3 rounded-lg font-semibold transition-all ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Revenue Potential</h3>
            <p className="text-gray-500 text-center text-sm mb-6">What you could earn with SurplusFlow at full capacity</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { stream: 'Per Case Commission', example: '1 case × $80K surplus × 25% = $20,000', roi: '$20K/case' },
                { stream: 'Lead Sales', example: '20 verified leads/month × $150', roi: '$3K/month' },
                { stream: 'Recovery at Scale', example: '5 cases/month × $80K × 25%', roi: '$100K+/month' },
              ].map((r) => (
                <div key={r.stream} className="text-center p-4 bg-white rounded-xl border border-green-100">
                  <div className="text-2xl font-black text-green-700 mb-1">{r.roi}</div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">{r.stream}</div>
                  <div className="text-xs text-gray-400">{r.example}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
