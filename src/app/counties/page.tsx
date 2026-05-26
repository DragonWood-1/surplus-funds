import PublicLayout from '@/components/layout/PublicLayout'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { US_STATES } from '@/lib/constants'
import Link from 'next/link'
import { Map, ExternalLink, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'County Tax Commissioner Directory – SurplusFlow',
  description: 'Complete directory of all county tax commissioners, sheriff sale notices, and excess funds records across the US.',
}

export default async function CountiesPage() {
  const counties = await prisma.county.findMany({ orderBy: [{ stateCode: 'asc' }, { name: 'asc' }] }).catch(() => [])

  const byState = counties.reduce((acc: Record<string, typeof counties>, county) => {
    if (!acc[county.stateCode]) acc[county.stateCode] = []
    acc[county.stateCode].push(county)
    return acc
  }, {})

  const statesWithCounties = Object.keys(byState).sort()

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-brand-900 to-brand-700 text-white px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20 mb-4">
              <Map className="h-7 w-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">County Tax Commissioner Directory</h1>
            <p className="text-brand-200 text-lg max-w-2xl mx-auto">
              Nationwide directory of county tax commissioners, sheriff sale notices, excess funds ledgers, and official claim forms.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {statesWithCounties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              {statesWithCounties.map(code => (
                <a key={code} href={`#${code}`} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors border border-gray-200 hover:border-brand-200">
                  {code}
                </a>
              ))}
            </div>
          )}

          {statesWithCounties.map(stateCode => {
            const stateName = US_STATES.find(s => s.code === stateCode)?.name || stateCode
            const stateCounties = byState[stateCode]
            return (
              <section key={stateCode} id={stateCode} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    STATE: <span className="text-brand-600">{stateName.toUpperCase()}</span>
                  </h2>
                  <span className="badge border-brand-200 text-brand-700 bg-brand-50">{stateCounties.length} counties</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stateCounties.map(county => (
                    <div key={county.id} className="card-hover group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{county.name} County</h3>
                          <div className="text-xs text-gray-400 mt-0.5">{stateCode}</div>
                        </div>
                        {county.totalSurplus > 0 && (
                          <span className="text-sm font-bold text-green-600">{formatCurrency(county.totalSurplus)}</span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {county.taxCommissionerUrl && (
                          <a href={county.taxCommissionerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-600 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Tax Commissioner
                          </a>
                        )}
                        {county.sheriffSaleUrl && (
                          <a href={county.sheriffSaleUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-600 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Sheriff Sale Notices
                          </a>
                        )}
                        {county.excessFundsUrl && (
                          <a href={county.excessFundsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-600 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Excess Funds Ledger
                          </a>
                        )}
                        {county.claimFormUrl && (
                          <a href={county.claimFormUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-600 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Claim Form
                          </a>
                        )}
                      </div>
                      {county.totalCases > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                          <span>{county.totalCases} cases tracked</span>
                          <Link href={`/search?state=${stateCode}&county=${encodeURIComponent(county.name)}`} className="flex items-center gap-1 text-brand-600 hover:underline font-medium">
                            View cases <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          })}

          {statesWithCounties.length === 0 && (
            <div className="card text-center py-16">
              <Map className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">County directory is loading</p>
              <p className="text-gray-400 text-sm mt-1">Data is seeded on first run. <Link href="/register" className="text-brand-600 underline">Sign up</Link> to access.</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
