import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/db'
import { formatRelative } from '@/lib/utils'
import Link from 'next/link'
import { MessageSquare, Plus, Send, Mail, Phone, Mic } from 'lucide-react'

export default async function OutreachPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  const userId = (session.user as any).id
  const logs = await prisma.outreachLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { lead: { select: { firstName: true, lastName: true } } },
  })
  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === 'SENT' || l.status === 'DELIVERED').length,
    responded: logs.filter(l => l.status === 'RESPONDED').length,
    responseRate: logs.length > 0 ? ((logs.filter(l => l.status === 'RESPONDED').length / logs.length) * 100).toFixed(1) : '0',
  }
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-brand-600" /> Outreach Center
          </h1>
          <p className="text-gray-500 mt-1">SMS, email, and voicemail campaigns</p>
        </div>
        <Link href="/outreach/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New Campaign
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Sent', value: stats.total, icon: Send, color: 'bg-blue-50 text-blue-600' },
          { label: 'Delivered', value: stats.sent, icon: Mail, color: 'bg-green-50 text-green-600' },
          { label: 'Responses', value: stats.responded, icon: MessageSquare, color: 'bg-purple-50 text-purple-600' },
          { label: 'Response Rate', value: `${stats.responseRate}%`, icon: Phone, color: 'bg-gold-50 text-gold-600' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.color.split(' ')[0]}`}>
              <s.icon className={`h-5 w-5 ${s.color.split(' ')[1]}`} />
            </div>
            <div>
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Outreach History</h2>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No outreach sent yet</p>
            <Link href="/outreach/new" className="btn-primary inline-flex">Send First Message</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="flex gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  log.channel === 'SMS' ? 'bg-blue-100 text-blue-700' :
                  log.channel === 'EMAIL' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {log.channel === 'EMAIL' ? <Mail className="h-4 w-4" /> : log.channel === 'VOICEMAIL' ? <Mic className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">{log.lead ? `${log.lead.firstName} ${log.lead.lastName}` : 'Unknown'}</span>
                    <span className="badge border-gray-200 text-gray-600 text-xs">{log.channel}</span>
                    <span className={`badge text-xs ${log.status === 'DELIVERED' || log.status === 'SENT' ? 'bg-green-50 text-green-700 border-green-200' : log.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{log.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{log.message}</p>
                  {log.response && <p className="text-sm text-brand-600 mt-0.5 truncate">Reply: {log.response}</p>}
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">{log.sentAt ? formatRelative(log.sentAt) : 'Pending'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="h-20 lg:h-0" />
    </DashboardLayout>
  )
}
