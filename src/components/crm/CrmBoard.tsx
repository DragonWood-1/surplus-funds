'use client'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

const COLUMNS = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as const

const colors: Record<string, string> = {
  NEW: 'border-blue-200 bg-blue-50 text-blue-700',
  CONTACTED: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  QUALIFIED: 'border-purple-200 bg-purple-50 text-purple-700',
  CONVERTED: 'border-green-200 bg-green-50 text-green-700',
  LOST: 'border-red-200 bg-red-50 text-red-700',
}

export default function CrmBoard({ leads }: { leads: any[] }) {
  const byStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = leads.filter(l => l.status === status)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(status => (
        <div key={status} className="flex-shrink-0 w-64">
          <div className={`rounded-xl border p-3 mb-3 ${colors[status]}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{status}</span>
              <span className="font-bold text-lg">{byStatus[status].length}</span>
            </div>
          </div>
          <div className="space-y-2">
            {byStatus[status].map(lead => (
              <Link key={lead.id} href={`/crm/${lead.id}`}>
                <div className="card p-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="font-medium text-sm text-gray-900">{lead.firstName} {lead.lastName}</div>
                  {lead.case && (
                    <div className="text-xs text-green-600 font-semibold mt-0.5">
                      {formatCurrency(lead.case.surplusAmount)}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{lead.source || 'Direct'}</div>
                </div>
              </Link>
            ))}
            {byStatus[status].length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                No leads
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
