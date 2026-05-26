'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, getLeadStatusColor } from '@/lib/utils'
import { Search, Phone, Mail, ChevronUp, ChevronDown } from 'lucide-react'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  status: string
  score: number
  source: string | null
  createdAt: Date
  case?: { id: string; surplusAmount: number; county: string; state: string } | null
}

export default function CrmTable({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState<{ field: string; dir: 'asc' | 'desc' }>({ field: 'createdAt', dir: 'desc' })

  const filtered = leads
    .filter(l => {
      const name = `${l.firstName} ${l.lastName}`.toLowerCase()
      const matchSearch = !search || name.includes(search.toLowerCase()) || l.email?.includes(search) || l.phone?.includes(search)
      const matchStatus = !statusFilter || l.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      if (sort.field === 'score') return (a.score - b.score) * dir
      if (sort.field === 'surplus') return ((a.case?.surplusAmount || 0) - (b.case?.surplusAmount || 0)) * dir
      if (sort.field === 'name') return `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`) * dir
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    })

  const toggleSort = (field: string) => {
    setSort(prev => ({ field, dir: prev.field === field && prev.dir === 'desc' ? 'asc' : 'desc' }))
  }

  const SortIcon = ({ field }: { field: string }) => (
    sort.field === field
      ? sort.dir === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3 opacity-30" />
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input sm:w-40">
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((lead) => (
          <div key={lead.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">{lead.firstName} {lead.lastName}</div>
                <span className={`badge mt-1 ${getLeadStatusColor(lead.status)}`}>{lead.status}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Score</div>
                <div className="font-bold text-gray-900">{lead.score.toFixed(0)}</div>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              {lead.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" /> {lead.phone}</div>}
              {lead.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" /> {lead.email}</div>}
              {lead.case && <div className="text-green-600 font-semibold">{formatCurrency(lead.case.surplusAmount)} surplus</div>}
            </div>
            <div className="flex gap-2">
              <Link href={`/crm/${lead.id}`} className="btn-primary flex-1 text-center py-1.5 text-xs">View</Link>
              <Link href={`/outreach/new?leadId=${lead.id}`} className="btn-secondary flex-1 text-center py-1.5 text-xs">Outreach</Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-8 text-gray-400">No leads found</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block table-wrapper">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase">Name <SortIcon field="name" /></div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('score')}>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase">Score <SortIcon field="score" /></div>
              </th>
              <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('surplus')}>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase">Surplus <SortIcon field="surplus" /></div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
              <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('createdAt')}>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase">Added <SortIcon field="createdAt" /></div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No leads found</td></tr>
            ) : filtered.map((lead) => (
              <tr key={lead.id} className="table-row">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex-shrink-0">
                      {lead.firstName[0]}{lead.lastName[0]}
                    </div>
                    <div className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="space-y-0.5">
                    {lead.phone && <div className="flex items-center gap-1 text-xs text-gray-600"><Phone className="h-3 w-3" /> {lead.phone}</div>}
                    {lead.email && <div className="flex items-center gap-1 text-xs text-gray-600"><Mail className="h-3 w-3" /> {lead.email}</div>}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`badge ${getLeadStatusColor(lead.status)}`}>{lead.status}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-brand-500 rounded-full" style={{ width: `${lead.score}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{lead.score.toFixed(0)}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  {lead.case ? (
                    <div>
                      <div className="font-semibold text-green-600 text-sm">{formatCurrency(lead.case.surplusAmount)}</div>
                      <div className="text-xs text-gray-400">{lead.case.county}, {lead.case.state}</div>
                    </div>
                  ) : <span className="text-gray-400 text-sm">—</span>}
                </td>
                <td className="px-4 py-3.5">
                  <span className="badge border-gray-200 text-gray-600">{lead.source || 'Direct'}</span>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/crm/${lead.id}`} className="btn-secondary py-1.5 px-3 text-xs">View</Link>
                    <Link href={`/outreach/new?leadId=${lead.id}`} className="btn-primary py-1.5 px-3 text-xs">Outreach</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
