import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '25')))
  const skip = (page - 1) * limit

  const where: any = { isPublic: true }

  const name = searchParams.get('name')
  if (name) where.ownerName = { contains: name, mode: 'insensitive' }

  const state = searchParams.get('state')
  if (state) where.state = state

  const county = searchParams.get('county')
  if (county) where.county = { contains: county, mode: 'insensitive' }

  const apn = searchParams.get('apn')
  if (apn) where.apn = { contains: apn, mode: 'insensitive' }

  const minAmount = searchParams.get('minAmount')
  if (minAmount) where.surplusAmount = { ...where.surplusAmount, gte: parseFloat(minAmount) }

  const maxAmount = searchParams.get('maxAmount')
  if (maxAmount) where.surplusAmount = { ...where.surplusAmount, lte: parseFloat(maxAmount) }

  const status = searchParams.get('status')
  if (status) where.status = status

  try {
    const [data, total] = await Promise.all([
      prisma.surplusCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { surplusAmount: 'desc' },
        select: {
          id: true,
          ownerName: true,
          county: true,
          state: true,
          surplusAmount: true,
          saleDate: true,
          status: true,
          priority: true,
          apn: true,
          claimDeadline: true,
        },
      }),
      prisma.surplusCase.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
