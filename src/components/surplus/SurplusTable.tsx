import Link from 'next/link'
import { MapPin, ArrowUpDown, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import { PaginatedResponse } from '@/types'

interface SurplusTableProps {
  results: PaginatedResponse<any>
  searchParams: Record<string, string | undefined>
}

export default function SurplusTable({ results, searchParams }: SurplusTableProps) {
  const { data: cases, total, page, limit, totalPages } = results

  const buildUrl = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams()
    const merged = { ...searchParams, ...newParams }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
    return `/search?${params.toString()}`
  }

  if (cases.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-gray-400 text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No cases found</h3>
        <p className="text-gray-500">Try adjusting your search filters or browse all cases.</p>
        <Link href="/search" className="btn-primary mt-4 inline-flex">Clear filters</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Showing <strong className="text-gray-900">{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong className="text-gray-900">{total.toLocaleString()}</strong> results
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Link href={buildUrl({ sort: 'surplusAmount', order: 'desc', page: 1 })} className={`text-xs px-2 py-1 rounded-md ${searchParams.sort === 'surplusAmount' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            Amount
          </Link>
          <Link href={buildUrl({ sort: 'saleDate', order: 'desc', page: 1 })} className={`text-xs px-2 py-1 rounded-md ${searchParams.sort === 'saleDate' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            Date
          </Link>
          <Link href={buildUrl({ sort: 'score', order: 'desc', page: 1 })} className={`text-xs px-2 py-1 rounded-md ${searchParams.sort === 'score' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            Score
          </Link>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {cases.map((c: any) => (
          <div key={c.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-gray-900">{c.ownerName}</div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" /> {c.county}, {c.state}
                </div>
              </div>
              <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Surplus Amount</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(c.surplusAmount)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Sale Date</div>
                <div className="text-sm text-gray-700">{formatDate(c.saleDate)}</div>
              </div>
            </div>
            {c.apn && <div className="text-xs text-gray-400">APN: {c.apn}</div>}
            <Link href={`/surplus/${c.id}`} className="btn-primary w-full text-center py-2">
              View Case Details
            </Link>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block table-wrapper">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Owner Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Surplus Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sale Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c: any) => (
              <tr key={c.id} className="table-row">
                <td className="px-4 py-3.5">
                  <div className="font-medium text-gray-900">{c.ownerName}</div>
                  {c.apn && <div className="text-xs text-gray-400 mt-0.5">APN: {c.apn}</div>}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {c.county}, {c.state}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="text-lg font-bold text-green-600">{formatCurrency(c.surplusAmount)}</div>
                  <div className="text-xs text-gray-400">Sale: {formatCurrency(c.salePrice)}</div>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(c.saleDate)}</td>
                <td className="px-4 py-3.5">
                  <span className={`badge ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link href={`/surplus/${c.id}`} className="btn-primary py-1.5 px-3 text-xs">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Link
            href={buildUrl({ page: page - 1 })}
            className={`btn-secondary py-2 px-3 text-sm ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Link>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <Link
                  key={p}
                  href={buildUrl({ page: p })}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${p === page ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {p}
                </Link>
              )
            })}
          </div>

          <Link
            href={buildUrl({ page: page + 1 })}
            className={`btn-secondary py-2 px-3 text-sm ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
