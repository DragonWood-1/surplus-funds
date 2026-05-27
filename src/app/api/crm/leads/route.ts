import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  caseId: z.string().optional().or(z.literal('')),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const leads = await prisma.crmLead.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { case: { select: { id: true, surplusAmount: true, county: true, state: true } } },
  })
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const lead = await prisma.crmLead.create({
      data: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        source: data.source,
        notes: data.notes,
        caseId: data.caseId || null,
        score: 50,
      },
    })
    await prisma.activity.create({
      data: {
        userId,
        leadId: lead.id,
        type: 'LEAD_CREATED',
        description: `Lead ${data.firstName} ${data.lastName} added to CRM`,
      },
    })
    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
