import Link from 'next/link'
import { Search, DollarSign, TrendingUp, Shield, Zap, ArrowRight, CheckCircle, MapPin, Star, ChevronRight } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import SearchBar from '@/components/ui/SearchBar'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getStatusColor } from '@/lib/utils'

const FEATURES = [
  {
    icon: Search,
    title: 'Nationwide Surplus Database',
    description: 'Access 3,200+ counties of tax delinquent sales, foreclosure auctions, and sheriff sale surplus records in real-time.',
    color: 'text-brand-600 bg-brand-50',
  },
  {
    icon: Zap,
    title: 'AI Owner Identification',
    description: 'Our AI skip tracing engine cross-references multiple data sources to locate property owners with high accuracy.',
    color: 'text-gold-600 bg-gold-50',
  },
  {
    icon: TrendingUp,
    title: 'Recovery Commission Engine',
    description: 'Track your recovery pipeline and automate commission calculations. Earn 20–35% on every recovered case.',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: Shield,
    title: 'Built-In CRM & Outreach',
    description: 'Manage leads, send personalized SMS/email campaigns, and track every touchpoint in one system.',
    color: 'text-purple-600 bg-purple-50',
  },
]

const STATS = [
  { label: 'Surplus Identified', value: '$2.4B+' },
  { label: 'Counties Covered', value: '3,200+' },
  { label: 'Cases Recovered', value: '12,000+' },
  { label: 'Avg. Return', value: '28%' },
]

async function getLatestCases() {
  try {
    return await prisma.surplusCase.findMany({
      take: 10,
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: { ownerContacts: { take: 1 } },
    })
  } catch {
    return []
  }
}

async function getHeroStats() {
  try {
    const [total, sum] = await Promise.all([
      prisma.surplusCase.count(),
      prisma.surplusCase.aggregate({ _sum: { surplusAmount: true } }),
    ])
    return { total, totalSurplus: sum._sum.surplusAmount || 0 }
  } catch {
    return { total: 0, totalSurplus: 0 }
  }
}

export default async function HomePage() {
  const [cases, heroStats] = await Promise.all([getLatestCases(), getHeroStats()])

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-700 bg-brand-800/50 px-4 py-1.5 text-sm font-medium text-brand-200 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Live surplus data updated daily across 3,200+ counties
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Find & Recover{' '}
              <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
                Unclaimed Surplus Funds
              </span>{' '}
              Nationwide
            </h1>

            <p className="text-lg sm:text-xl text-brand-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              The #1 proprietary platform aggregating tax delinquent sales, foreclosure auctions, and sheriff sales data with AI-powered owner identification and automated outreach.
            </p>

            {/* Search */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 max-w-3xl mx-auto mb-8">
              <SearchBar compact={false} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-gold text-base px-6 py-3">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/search" className="flex items-center gap-2 text-brand-200 hover:text-white transition-colors font-medium">
                Browse database <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Live stats bar */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-brand-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run a{' '}
              <span className="text-gradient">Surplus Recovery Business</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From data ingestion to commission tracking — SurplusFlow is the complete operating system for surplus fund recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover group">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Surplus Cases */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest Surplus Cases</h2>
              <p className="text-gray-500 mt-1">Recently identified unclaimed surplus funds ready for recovery</p>
            </div>
            <Link href="/search" className="btn-secondary flex-shrink-0">
              View all cases <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="table-wrapper">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">County / State</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Surplus Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Sale Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        No cases available yet. <Link href="/register" className="text-brand-600 underline">Sign up</Link> to access the full database.
                      </td>
                    </tr>
                  ) : (
                    cases.map((c) => (
                      <tr key={c.id} className="table-row">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-gray-900">{c.ownerName}</div>
                          <div className="text-xs text-gray-400 sm:hidden">{c.county}, {c.state}</div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            {c.county}, {c.state}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-lg font-bold text-green-600">{formatCurrency(c.surplusAmount)}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell text-sm text-gray-500">
                          {formatDate(c.saleDate)}
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link href={`/surplus/${c.id}`} className="btn-primary py-1.5 px-3 text-xs">
                            View Case
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Money Engine CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-8 md:p-12 lg:p-16 text-white text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The Complete Money Engine Loop
            </h2>
            <p className="text-brand-200 text-lg mb-10 max-w-2xl mx-auto">
              Find money → Locate owner → Contact owner → Close claim → Take commission → Reinvest → Scale again
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
              {[
                { step: '01', label: 'Find Surplus', desc: 'AI scans 3,200+ counties' },
                { step: '02', label: 'Locate Owner', desc: 'Skip trace + AI match' },
                { step: '03', label: 'Auto Outreach', desc: 'SMS + Email + Calls' },
                { step: '04', label: 'Earn Commission', desc: '20–35% of recovery' },
              ].map((item) => (
                <div key={item.step} className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="text-3xl font-black text-gold-400 mb-2">{item.step}</div>
                  <div className="font-semibold text-sm mb-1">{item.label}</div>
                  <div className="text-xs text-brand-300">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-gold text-base px-8 py-3">
                Start Your Free Trial
              </Link>
              <Link href="/pricing" className="text-brand-200 hover:text-white transition-colors font-medium flex items-center gap-1">
                View pricing <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-500">Choose the plan that fits your recovery operation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: 99, features: ['500 cases/month', 'Basic contact info', 'Email alerts', 'CSV export'] },
              { name: 'Professional', price: 299, features: ['Unlimited cases', 'Full owner enrichment', 'AI skip tracing', 'SMS/Email outreach', 'CRM system', 'Lead marketplace'], popular: true },
              { name: 'Enterprise', price: 999, features: ['Everything in Pro', 'API access', 'Recovery commission tracking', 'Attorney network', 'Dedicated support'] },
            ].map((plan) => (
              <div key={plan.name} className={`card relative ${plan.popular ? 'border-brand-500 ring-2 ring-brand-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-xl text-gray-900 mb-1">{plan.name}</h3>
                <div className="text-3xl font-black text-gray-900 mb-4">
                  ${plan.price}<span className="text-sm font-normal text-gray-400">/mo</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={plan.popular ? 'btn-primary w-full text-center' : 'btn-secondary w-full text-center'}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
