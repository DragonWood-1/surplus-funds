import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import FunnelChart from '@/components/dashboard/FunnelChart'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import Link from 'next/link'
import {
  DollarSign, TrendingUp, Users, FileText, ArrowRight,
  AlertTriangle, CheckCircle, Clock, Zap
} from 'lucide-react'

async function getDashboardData(userId: string) {
  const [
    totalCases,
    activeCases,
    recoveredCases,
    totalLeads,
    totalSurplus,
    highValueCases,
    recentCases,
    recentLeads,
    revenueEvents,
    deadlineCases,
  ] = await Promise.all([
    prisma.surplusCase.count(),
    prisma.surplusCase.count({ where: { status: { in: ['ACTIVE', 'CONTACTED', 'VERIFIED'] } } }),
    prisma.surplusCase.count({ where: { status: 'RECOVERED' } }),
    prisma.crmLead.count({ where: { userId } }),
    prisma.surplusCase.aggregate({ _sum: { surplusAmount: true } }),
    prisma.surplusCase.findMany({
      where: { priority: 'HIGH', status: { not: 'RECOVERED' } },
      take: 5,
      orderBy: { score: 'desc' },
    }),
    prisma.surplusCase.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.crmLead.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { case: true },
    }),
    prisma.revenueEvent.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.surplusCase.findMany({
      where: {
        claimDeadline: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        status: { notIn: ['RECOVERED', 'CLOSED', 'EXPIRED'] },
      },
      take: 5,
      orderBy: { claimDeadline: 'asc' },
    }),
  ])

  const monthlyRevenue = revenueEvents
    .filter(e => new Date(e.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0)

  const conversionRate = totalLeads > 0
    ? ((await prisma.crmLead.count({ where: { userId, status: 'CONVERTED' } })) / totalLeads) * 100
    : 0

  // Build revenue chart data (last 6 months)
  const revenueByMonth: Record<string, { saas: number; leads: number; recovery: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = d.toLocaleString('default', { month: 'short' })
    revenueByMonth[key] = { saas: 0, leads: 0, recovery: 0 }
  }

  revenueEvents.forEach(e => {
    const month = new Date(e.createdAt).toLocaleString('default', { month: 'short' })
    if (revenueByMonth[month]) {
      if (e.type === 'SAAS') revenueByMonth[month].saas += e.amount
      else if (e.type === 'LEAD_SALE') revenueByMonth[month].leads += e.amount
      else if (e.type === 'RECOVERY_COMMISSION') revenueByMonth[month].recovery += e.amount
    }
  })

  const revenueChartData = Object.entries(revenueByMonth).map(([month, vals]) => ({
    month,
    ...vals,
    total: vals.saas + vals.leads + vals.recovery,
  }))

  return {
    totalCases,
    activeCases,
    recoveredCases,
    totalLeads,
    totalSurplus: totalSurplus._sum.surplusAmount || 0,
    monthlyRevenue,
    conversionRate,
    highValueCases,
    recentCases,
    recentLeads,
    revenueChartData,
    deadlineCases,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = (session.user as any).id
  const data = await getDashboardData(userId)

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your surplus recovery overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/search" className="btn-secondary text-sm">Browse Database</Link>
          <Link href="/crm/new" className="btn-primary text-sm">Add Lead</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Surplus Identified"
          value={formatCurrency(data.totalSurplus)}
          icon={DollarSign}
          color="green"
          trend={{ value: 12.5, label: 'this month' }}
        />
        <StatCard
          title="Active Cases"
          value={data.activeCases.toLocaleString()}
          subtitle={`of ${data.totalCases.toLocaleString()} total`}
          icon={FileText}
          color="blue"
          trend={{ value: 8.2, label: 'vs last month' }}
        />
        <StatCard
          title="CRM Leads"
          value={data.totalLeads.toLocaleString()}
          subtitle={`${data.conversionRate.toFixed(1)}% conversion`}
          icon={Users}
          color="purple"
          trend={{ value: 15.3, label: 'new this week' }}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(data.monthlyRevenue)}
          icon={TrendingUp}
          color="gold"
          trend={{ value: 24.1, label: 'vs last month' }}
        />
      </div>

      {/* Revenue Chart + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Revenue Breakdown</h2>
            <span className="badge border-gray-200 text-gray-600">Last 6 months</span>
          </div>
          <RevenueChart data={data.revenueChartData} />
        </div>
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Recovery Funnel</h2>
          <FunnelChart
            data={[
              { label: 'Total Cases', value: data.totalCases, color: '#0284c7' },
              { label: 'Active', value: data.activeCases, color: '#7c3aed' },
              { label: 'Contacted', value: Math.round(data.activeCases * 0.6), color: '#d97706' },
              { label: 'Verified', value: Math.round(data.activeCases * 0.3), color: '#059669' },
              { label: 'Recovered', value: data.recoveredCases, color: '#16a34a' },
            ]}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High value cases */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-gold-500" /> High Value Cases
            </h2>
            <Link href="/search?sort=surplusAmount&order=desc" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {data.highValueCases.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No high value cases</p>
            ) : data.highValueCases.map((c) => (
              <Link key={c.id} href={`/surplus/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors text-sm">{c.ownerName}</div>
                  <div className="text-xs text-gray-400">{c.county}, {c.state}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600 text-sm">{formatCurrency(c.surplusAmount)}</div>
                  <div className="text-xs text-gray-400">Score: {c.score.toFixed(0)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Deadline alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" /> Expiring Soon
            </h2>
            <span className="badge border-red-200 text-red-600 bg-red-50">{data.deadlineCases.length} cases</span>
          </div>
          <div className="space-y-3">
            {data.deadlineCases.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No cases expiring soon</p>
            ) : data.deadlineCases.map((c) => {
              const daysLeft = Math.ceil((new Date(c.claimDeadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <Link key={c.id} href={`/surplus/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors group border border-red-100">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{c.ownerName}</div>
                    <div className="text-xs text-gray-400">{formatCurrency(c.surplusAmount)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${daysLeft <= 7 ? 'text-red-600' : 'text-orange-500'}`}>{daysLeft}d left</div>
                    <div className="text-xs text-gray-400">{formatDate(c.claimDeadline!)}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <Link href="/crm" className="text-sm text-brand-600 hover:underline">View CRM</Link>
          </div>
          <div className="space-y-3">
            {data.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex-shrink-0">
                  {lead.firstName[0]}{lead.lastName[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{lead.firstName} {lead.lastName}</div>
                  <div className="text-xs text-gray-400 truncate">{lead.status} · {lead.source || 'Direct'}</div>
                </div>
                {lead.case && (
                  <div className="ml-auto text-xs font-semibold text-green-600 flex-shrink-0">
                    {formatCurrency(lead.case.surplusAmount)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile bottom padding */}
      <div className="h-20 lg:h-0" />
    </DashboardLayout>
  )
}
