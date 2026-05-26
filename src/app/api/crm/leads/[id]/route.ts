import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const lead = await prisma.crmLead.findFirst({
    where: { id: params.id, userId },
    include: {
      case: true,
      outreachLogs: { orderBy: { createdAt: 'desc' } },
      activities: { orderBy: { createdAt: 'desc' } },
      crmNotes: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lead)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const body = await req.json()
  const lead = await prisma.crmLead.findFirst({ where: { id: params.id, userId } })
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const updated = await prisma.crmLead.update({
    where: { id: params.id },
    data: {
      status: body.status,
      score: body.score,
      notes: body.notes,
      nextFollowUp: body.nextFollowUp ? new Date(body.nextFollowUp) : undefined,
      tags: body.tags,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const lead = await prisma.crmLead.findFirst({ where: { id: params.id, userId } })
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.crmLead.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
