import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import RevenueChart from '@/components/dashboard/RevenueChart'
import { BarChart2, TrendingUp, DollarSign, Users, Map, Activity } from 'lucide-react'

async function getAnalyticsData() {
  const [
    casesByState,
    casesByStatus,
    surplusByMonth,
    revenueEvents,
    leadsByStatus,
  ] = await Promise.all([
    prisma.surplusCase.groupBy({ by: ['state'], _count: { id: true }, _sum: { surplusAmount: true }, orderBy: { _sum: { surplusAmount: 'desc' } }, take: 10 }),
    prisma.surplusCase.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.surplusCase.findMany({ take: 500, orderBy: { saleDate: 'desc' }, select: { saleDate: true, surplusAmount: true } }),
    prisma.revenueEvent.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
    prisma.crmLead.groupBy({ by: ['status'], _count: { id: true } }),
  ])

  const monthlyRevenue: Record<string, { saas: number; leads: number; recovery: number; total: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = d.toLocaleString('default', { month: 'short' })
    monthlyRevenue[key] = { saas: 0, leads: 0, recovery: 0, total: 0 }
  }
  revenueEvents.forEach(e => {
    const month = new Date(e.createdAt).toLocaleString('default', { month: 'short' })
    if (monthlyRevenue[month]) {
      const type = e.type === 'SAAS' ? 'saas' : e.type === 'LEAD_SALE' ? 'leads' : 'recovery'
      monthlyRevenue[month][type] += e.amount
      monthlyRevenue[month].total += e.amount
    }
  })

  const totalRevenue = revenueEvents.reduce((s, e) => s + e.amount, 0)
  const avgCaseValue = await prisma.surplusCase.aggregate({ _avg: { surplusAmount: true } })

  return {
    casesByState,
    casesByStatus,
    revenueChartData: Object.entries(monthlyRevenue).map(([month, vals]) => ({ month, ...vals })),
    totalRevenue,
    avgCaseValue: avgCaseValue._avg.surplusAmount || 0,
    leadsByStatus,
  }
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const data = await getAnalyticsData()

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-brand-600" /> Analytics
        </h1>
        <p className="text-gray-500 mt-1">Performance metrics and revenue intelligence</p>
      </div>

      {/* Revenue chart */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Revenue by Stream (Last 6 Months)</h2>
        <RevenueChart data={data.revenueChartData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Cases by state */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Map className="h-4 w-4 text-brand-600" /> Top States by Surplus
          </h2>
          <div className="space-y-3">
            {data.casesByState.map((s) => {
              const pct = ((s._sum.surplusAmount || 0) / (data.casesByState[0]._sum.surplusAmount || 1)) * 100
              return (
                <div key={s.state}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">{s.state}</span>
                    <div className="flex gap-3">
                      <span className="text-gray-500">{s._count.id} cases</span>
                      <span className="font-semibold text-green-600">{formatCurrency(s._sum.surplusAmount || 0)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cases by status */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-600" /> Cases by Status
          </h2>
          <div className="space-y-3">
            {data.casesByStatus.map((s) => {
              const colors: Record<string, string> = {
                NEW: '#0284c7', ACTIVE: '#7c3aed', CONTACTED: '#d97706',
                VERIFIED: '#0891b2', SIGNED: '#ea580c', RECOVERED: '#16a34a', CLOSED: '#6b7280', EXPIRED: '#dc2626',
              }
              return (
                <div key={s.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[s.status] || '#6b7280' }} />
                    <span className="text-sm text-gray-700">{s.status}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{s._count.id.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { label: 'Avg Case Value', value: formatCurrency(data.avgCaseValue), icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
          { label: 'Lead Conversion', value: `${((data.leadsByStatus.find(l => l.status === 'CONVERTED')?._count.id || 0) / Math.max(data.leadsByStatus.reduce((s, l) => s + l._count.id, 0), 1) * 100).toFixed(1)}%`, icon: Users, color: 'bg-purple-50 text-purple-600' },
          { label: 'Avg Commission', value: formatCurrency(data.avgCaseValue * 0.25), icon: BarChart2, color: 'bg-gold-50 text-gold-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${kpi.color.split(' ')[0]}`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color.split(' ')[1]}`} />
            </div>
            <div>
              <div className="text-xs text-gray-500">{kpi.label}</div>
              <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-20 lg:h-0" />
    </DashboardLayout>
  )
}
