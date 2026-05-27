import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  try {
    const { channel, message, leadId, caseId, scheduledAt } = await req.json()
    if (!message || !channel) return NextResponse.json({ error: 'Message and channel required' }, { status: 400 })
    const log = await prisma.outreachLog.create({
      data: {
        userId,
        channel,
        message,
        leadId: leadId || null,
        caseId: caseId || null,
        status: scheduledAt ? 'PENDING' : 'SENT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentAt: scheduledAt ? null : new Date(),
      },
    })
    if (leadId) {
      await prisma.activity.create({ data: { userId, leadId, type: 'OUTREACH_SENT', description: `${channel} outreach sent` } })
    }
    return NextResponse.json(log, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const logs = await prisma.outreachLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { lead: { select: { firstName: true, lastName: true } } },
  })
  return NextResponse.json(logs)
}
