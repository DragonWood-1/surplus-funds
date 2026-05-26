import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate, formatRelative, getLeadStatusColor } from '@/lib/utils'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Mail, MapPin, DollarSign,
  MessageSquare, ExternalLink, CheckCircle, Clock
} from 'lucide-react'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = (session.user as any).id
  const lead = await prisma.crmLead.findFirst({
    where: { id: params.id, userId },
    include: {
      case: true,
      outreachLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
      activities: { orderBy: { createdAt: 'desc' }, take: 10 },
      crmNotes: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })

  if (!lead) notFound()

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/crm" className="btn-secondary text-sm py-2 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to CRM
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xl flex-shrink-0">
                  {lead.firstName[0]}{lead.lastName[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{lead.firstName} {lead.lastName}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`badge ${getLeadStatusColor(lead.status)}`}>{lead.status}</span>
                    <span className="text-sm text-gray-400">{lead.source || 'Direct'} · Score: {lead.score.toFixed(0)}</span>
                  </div>
                </div>
              </div>
              <Link href={`/outreach/new?leadId=${lead.id}`} className="btn-primary text-sm">
                <MessageSquare className="h-4 w-4" /> Send Outreach
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brand-600 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Phone</div>
                    <div className="text-sm font-semibold text-gray-900">{lead.phone}</div>
                  </div>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-600 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Email</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{lead.email}</div>
                  </div>
                </div>
              )}
              {lead.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-600 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Address</div>
                    <div className="text-sm font-semibold text-gray-900">{lead.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Linked case */}
          {lead.case && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" /> Linked Surplus Case
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-3xl font-black text-green-700">{formatCurrency(lead.case.surplusAmount)}</div>
                    <div className="text-sm text-gray-600 mt-1">{lead.case.propertyAddress}, {lead.case.city} {lead.case.state}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Sale: {formatDate(lead.case.saleDate)}</div>
                  </div>
                  <Link href={`/surplus/${lead.case.id}`} className="btn-primary text-sm">
                    View Case <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Outreach history */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-600" /> Outreach History
              </h2>
              <Link href={`/outreach/new?leadId=${lead.id}`} className="btn-secondary text-xs py-1.5 px-3">+ New</Link>
            </div>
            {lead.outreachLogs.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No outreach sent yet</p>
            ) : (
              <div className="space-y-3">
                {lead.outreachLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      log.channel === 'SMS' ? 'bg-blue-100 text-blue-700' :
                      log.channel === 'EMAIL' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {log.channel[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-xs font-semibold text-gray-700">{log.channel}</span>
                        <span className={`badge text-xs ${
                          log.status === 'SENT' || log.status === 'DELIVERED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>{log.status}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{log.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{log.sentAt ? formatRelative(log.sentAt) : 'Pending'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Notes</h2>
            {lead.crmNotes.length === 0 ? (
              <p className="text-gray-400 text-sm">No notes yet</p>
            ) : (
              <div className="space-y-3">
                {lead.crmNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelative(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Lead Details</h3>
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Status</dt>
                <dd><span className={`badge ${getLeadStatusColor(lead.status)}`}>{lead.status}</span></dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Score</dt>
                <dd className="font-semibold text-gray-900">{lead.score.toFixed(0)}/100</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Source</dt>
                <dd className="font-semibold text-gray-900">{lead.source || 'Direct'}</dd>
              </div>
              {lead.nextFollowUp && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Follow-up</dt>
                  <dd className="font-semibold text-gray-900">{formatDate(lead.nextFollowUp)}</dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Added</dt>
                <dd className="text-gray-900">{formatDate(lead.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {lead.tags.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag: string) => (
                  <span key={tag} className="badge border-brand-200 text-brand-700 bg-brand-50">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-20 lg:h-0" />
    </DashboardLayout>
  )
}
