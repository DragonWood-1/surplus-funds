import { Suspense } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import SearchBar from '@/components/ui/SearchBar'
import SurplusTable from '@/components/surplus/SurplusTable'
import { prisma } from '@/lib/db'
import { SearchParams } from '@/types'
import { Filter, Database, AlertCircle } from 'lucide-react'

async function getCases(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page || '1'))
  const limit = Math.min(50, Math.max(10, parseInt(params.limit || '25')))
  const skip = (page - 1) * limit

  const where: any = { isPublic: true }

  if (params.name) {
    where.ownerName = { contains: params.name, mode: 'insensitive' }
  }
  if (params.state) where.state = params.state
  if (params.county) {
    where.county = { contains: params.county, mode: 'insensitive' }
  }
  if (params.apn) {
    where.apn = { contains: params.apn, mode: 'insensitive' }
  }
  if (params.minAmount) {
    where.surplusAmount = { ...where.surplusAmount, gte: parseFloat(params.minAmount) }
  }
  if (params.maxAmount) {
    where.surplusAmount = { ...where.surplusAmount, lte: parseFloat(params.maxAmount) }
  }
  if (params.status) where.status = params.status

  const orderBy: any = {}
  const sortField = params.sort || 'createdAt'
  const sortOrder = params.order || 'desc'
  orderBy[sortField] = sortOrder

  const [cases, total] = await Promise.all([
    prisma.surplusCase.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { ownerContacts: { take: 1, select: { phone: true, email: true } } },
    }),
    prisma.surplusCase.count({ where }),
  ])

  return { data: cases, total, page, limit, totalPages: Math.ceil(total / limit) }
}

interface PageProps {
  searchParams: SearchParams
}

export default async function SearchPage({ searchParams }: PageProps) {
  const results = await getCases(searchParams)

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-5 w-5 text-brand-600" />
              <h1 className="text-2xl font-bold text-gray-900">Surplus Funds Database</h1>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              {results.total.toLocaleString()} cases found · Search by owner name, state, county, or parcel number
            </p>
            <SearchBar defaultValues={searchParams} />
          </div>
        </div>

        {/* Results */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <SurplusTable results={results} searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </PublicLayout>
  )
}
