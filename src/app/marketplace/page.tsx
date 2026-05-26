import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PublicLayout from '@/components/layout/PublicLayout'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingBag, Lock, Star, Zap, CheckCircle } from 'lucide-react'

async function getMarketplaceCases() {
  const items = await prisma.leadMarketplaceItem.findMany({
    where: { isAvailable: true },
    orderBy: { price: 'desc' },
  }).catch(() => [])
  if (items.length === 0) return []
  const caseIds = items.map(i => i.caseId)
  const cases = await prisma.surplusCase.findMany({
    where: { id: { in: caseIds } },
    select: { id: true, ownerName: true, county: true, state: true, surplusAmount: true, saleDate: true, status: true, score: true },
  })
  const caseMap = Object.fromEntries(cases.map(c => [c.id, c]))
  return items.map(item => ({ ...item, case: caseMap[item.caseId] }))
}

export const metadata = { title: 'Lead Marketplace – SurplusFlow' }

export default async function MarketplacePage() {
  const [session, items] = await Promise.all([getServerSession(authOptions), getMarketplaceCases()])
  const isPro = !!session?.user && ['ADMIN', 'PROFESSIONAL', 'ENTERPRISE'].includes((session?.user as any)?.role)

  const tiers = {
    PREMIUM: items.filter(i => i.tier === 'PREMIUM'),
    VERIFIED: items.filter(i => i.tier === 'VERIFIED'),
    BASIC: items.filter(i => i.tier === 'BASIC'),
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-brand-950 to-brand-800 text-white px-4 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20 mb-4">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Lead Marketplace</h1>
          <p className="text-brand-200 text-lg max-w-2xl mx-auto">
            Purchase verified surplus fund leads — pre-qualified with owner contact info, case documents, and AI scoring.
          </p>
          {!isPro && (
            <div className="mt-6">
              <Link href="/pricing" className="btn-gold">Upgrade to Access Marketplace</Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { tier: 'BASIC', price: '$25', icon: Zap, desc: 'Name, county, surplus amount', color: 'border-gray-200 bg-gray-50 text-gray-700' },
            { tier: 'VERIFIED', price: '$150', icon: CheckCircle, desc: 'Full contact info, verified data', color: 'border-blue-200 bg-blue-50 text-blue-700' },
            { tier: 'PREMIUM', price: '$400+', icon: Star, desc: 'Attorney-ready, all documents', color: 'border-gold-200 bg-gold-50 text-gold-700' },
          ].map(t => (
            <div key={t.tier} className={`flex items-center gap-3 rounded-xl border p-4 ${t.color}`}>
              <t.icon className="h-5 w-5 flex-shrink-0" />
              <div>
                <div className="font-bold">{t.tier} – {t.price}</div>
                <div className="text-xs opacity-75">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {(['PREMIUM', 'VERIFIED', 'BASIC'] as const).map(tier => {
          const tierItems = tiers[tier]
          if (tierItems.length === 0) return null
          const icons = { PREMIUM: Star, VERIFIED: CheckCircle, BASIC: Zap }
          const Icon = icons[tier]
          return (
            <section key={tier} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-5 w-5 text-brand-500" />
                <h2 className="text-xl font-bold text-gray-900">{tier} Leads</h2>
                <span className="badge border-gray-200 text-gray-600">{tierItems.length} available</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tierItems.map(item => (
                  <MarketplaceCard key={item.id} item={item} isPro={isPro} />
                ))}
              </div>
            </section>
          )
        })}
        {items.length === 0 && (
          <div className="card text-center py-16">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No marketplace listings at this time. Check back soon.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

function MarketplaceCard({ item, isPro }: { item: any; isPro: boolean }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className={`badge ${
          item.tier === 'PREMIUM' ? 'border-gold-200 bg-gold-50 text-gold-700' :
          item.tier === 'VERIFIED' ? 'border-blue-200 bg-blue-50 text-blue-700' :
          'border-gray-200 bg-gray-50 text-gray-700'
        }`}>{item.tier}</span>
        <span className="text-xl font-bold text-gray-900">{formatCurrency(item.price)}</span>
      </div>
      {item.case ? (
        <>
          <div className="font-semibold text-gray-900 mb-1">
            {isPro ? item.case.ownerName : `${item.case.ownerName.split(' ')[0]} ****`}
          </div>
          <div className="text-sm text-gray-500 mb-2">{item.case.county}, {item.case.state}</div>
          <div className="text-2xl font-black text-green-700 mb-3">{formatCurrency(item.case.surplusAmount)}</div>
          <div className="text-xs text-gray-400 mb-4">Score: {item.case.score?.toFixed(0) ?? '—'}/100</div>
        </>
      ) : (
        <div className="h-20 flex items-center justify-center text-gray-300 text-sm">—</div>
      )}
      {isPro ? (
        <button className="btn-primary w-full text-sm py-2">Purchase Lead</button>
      ) : (
        <Link href="/pricing" className="btn-secondary w-full text-center text-sm py-2 flex items-center justify-center gap-2">
          <Lock className="h-3.5 w-3.5" /> Upgrade to Purchase
        </Link>
      )}
    </div>
  )
}
