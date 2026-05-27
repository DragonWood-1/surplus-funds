import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, TrendingUp, Percent, BarChart2 } from 'lucide-react'

export default async function RevenuePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const events = await prisma.revenueEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const totalRevenue = events.reduce((s, e) => s + e.amount, 0)
  const saasRevenue = events.filter(e => e.type === 'SAAS').reduce((s, e) => s + e.amount, 0)
  const leadRevenue = events.filter(e => e.type === 'LEAD_SALE').reduce((s, e) => s + e.amount, 0)
  const commissionRevenue = events
    .filter(e => e.type === 'RECOVERY_COMMISSION')
    .reduce((s, e) => s + e.amount, 0)

  const recoveredCases = await prisma.surplusCase.findMany({
    where: { status: 'RECOVERED' },
    select: {
      id: true,
      ownerName: true,
      surplusAmount: true,
      county: true,
      state: true,
      saleDate: true,
    },
    take: 20,
    orderBy: { surplusAmount: 'desc' },
  })

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-brand-600" /> Revenue Engine
        </h1>
        <p className="text-gray-500 mt-1">Track commissions, SaaS revenue, and lead sales</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { label: 'SaaS Revenue', value: formatCurrency(saasRevenue), icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
          { label: 'Lead Sales', value: formatCurrency(leadRevenue), icon: BarChart2, color: 'bg-purple-50 text-purple-600' },
          { label: 'Commissions', value: formatCurrency(commissionRevenue), icon: Percent, color: 'bg-gold-50 text-gold-600' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color.split(' ')[0]}`}>
              <s.icon className={`h-5 w-5 ${s.color.split(' ')[1]}`} />
            </div>
            <div>
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Recovery Commissions', amount: commissionRevenue, color: 'bg-green-500' },
              { label: 'SaaS Subscriptions', amount: saasRevenue, color: 'bg-blue-500' },
              { label: 'Lead Sales', amount: leadRevenue, color: 'bg-purple-500' },
            ].map(s => {
              const pct = totalRevenue > 0 ? (s.amount / totalRevenue) * 100 : 0
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{s.label}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(s.amount)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full">
                    <div className={`h-2.5 rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{pct.toFixed(1)}% of total</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Commission Calculator</h2>
          <div className="space-y-3">
            {[
              { surplus: 25000, rate: 0.25 },
              { surplus: 50000, rate: 0.25 },
              { surplus: 80000, rate: 0.25 },
              { surplus: 150000, rate: 0.30 },
              { surplus: 300000, rate: 0.30 },
            ].map(({ surplus, rate }) => (
              <div key={surplus} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="font-medium text-gray-900">{formatCurrency(surplus)}</span>
                  <span className="text-gray-400 ml-2">× {(rate * 100).toFixed(0)}%</span>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(surplus * rate)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Commission rate typically 20–35% by agreement</p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Recovered Cases</h2>
        {recoveredCases.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No recovered cases yet</p>
        ) : (
          <div className="table-wrapper">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Surplus</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Est. Commission (25%)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {recoveredCases.map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.ownerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.county}, {c.state}</td>
                    <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(c.surplusAmount)}</td>
                    <td className="px-4 py-3 font-bold text-brand-600">{formatCurrency(c.surplusAmount * 0.25)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(c.saleDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="h-20 lg:h-0" />
    </DashboardLayout>
  )
}
