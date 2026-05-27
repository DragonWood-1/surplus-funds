import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/db'
import CrmBoard from '@/components/crm/CrmBoard'
import CrmTable from '@/components/crm/CrmTable'
import Link from 'next/link'
import { Users, Plus, Download, Filter, LayoutList, Columns } from 'lucide-react'

async function getLeads(userId: string) {
  return prisma.crmLead.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      case: {
        select: { id: true, ownerName: true, surplusAmount: true, county: true, state: true },
      },
    },
  })
}

export default async function CrmPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = (session.user as any).id
  const leads = await getLeads(userId)

  const counts = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    contacted: leads.filter(l => l.status === 'CONTACTED').length,
    qualified: leads.filter(l => l.status === 'QUALIFIED').length,
    converted: leads.filter(l => l.status === 'CONVERTED').length,
    lost: leads.filter(l => l.status === 'LOST').length,
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-600" /> CRM Pipeline
          </h1>
          <p className="text-gray-500 mt-1">{counts.total} leads · {counts.converted} converted</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-secondary text-sm">
            <Download className="h-4 w-4" /> Export
          </button>
          <Link href="/crm/new" className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Add Lead
          </Link>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'New', count: counts.new, color: 'border-blue-200 bg-blue-50 text-blue-700' },
          { label: 'Contacted', count: counts.contacted, color: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
          { label: 'Qualified', count: counts.qualified, color: 'border-purple-200 bg-purple-50 text-purple-700' },
          { label: 'Converted', count: counts.converted, color: 'border-green-200 bg-green-50 text-green-700' },
          { label: 'Lost', count: counts.lost, color: 'border-red-200 bg-red-50 text-red-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <CrmTable leads={leads} />

      <div className="h-20 lg:h-0" />
    </DashboardLayout>
  )
}
