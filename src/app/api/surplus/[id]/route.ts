import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isPro = session?.user && ['ADMIN', 'PROFESSIONAL'].includes((session.user as any).role)

  try {
    const surplusCase = await prisma.surplusCase.findUnique({
      where: { id: params.id },
      include: {
        ownerContacts: isPro,
        propertyRecords: true,
        claimForms: true,
        documents: true,
      },
    })

    if (!surplusCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    return NextResponse.json(surplusCase)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
