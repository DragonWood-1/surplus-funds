'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { US_STATES } from '@/lib/constants'

interface SearchBarProps {
  defaultValues?: {
    name?: string
    state?: string
    county?: string
    apn?: string
  }
  compact?: boolean
}

export default function SearchBar({ defaultValues = {}, compact = false }: SearchBarProps) {
  const router = useRouter()
  const [values, setValues] = useState(defaultValues)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    Object.entries(values).forEach(([k, v]) => { if (v) params.set(k, v) })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className={compact ? 'flex flex-col sm:flex-row gap-2' : 'space-y-3'}>
        <div className={compact ? 'flex flex-1 gap-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Owner name..."
              value={values.name || ''}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className="input pl-9"
            />
          </div>

          {!compact && (
            <>
              <select
                value={values.state || ''}
                onChange={(e) => setValues({ ...values, state: e.target.value })}
                className="input"
              >
                <option value="">All States</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="County..."
                value={values.county || ''}
                onChange={(e) => setValues({ ...values, county: e.target.value })}
                className="input"
              />

              <input
                type="text"
                placeholder="Parcel # (APN)..."
                value={values.apn || ''}
                onChange={(e) => setValues({ ...values, apn: e.target.value })}
                className="input"
              />
            </>
          )}
        </div>

        <div className="flex gap-2">
          {!compact && (
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="btn-secondary gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}
          <button type="submit" className="btn-primary flex-1 sm:flex-none">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {showAdvanced && !compact && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <label className="label">Min Surplus Amount</label>
            <input type="number" placeholder="$10,000" className="input" onChange={(e) => setValues({ ...values })} />
          </div>
          <div>
            <label className="label">Max Surplus Amount</label>
            <input type="number" placeholder="$500,000" className="input" />
          </div>
          <div>
            <label className="label">Case Status</label>
            <select className="input">
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ACTIVE">Active</option>
              <option value="CONTACTED">Contacted</option>
              <option value="RECOVERED">Recovered</option>
            </select>
          </div>
        </div>
      )}
    </form>
  )
}
