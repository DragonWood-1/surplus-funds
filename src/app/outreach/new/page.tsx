'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, Loader2, Wand2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const TEMPLATES = [
  { name: 'Surplus Notification', channel: 'SMS', message: 'Hi {name}, we located unclaimed surplus funds that may belong to you from a property sale. Reply YES for a free review.' },
  { name: 'Recovery Offer', channel: 'EMAIL', message: 'Dear {name},\n\nWe have identified potential unclaimed surplus funds tied to your property record. Our team can help you recover these funds within 7-14 days.\n\nPlease reply to schedule a free consultation.' },
  { name: 'Follow-Up', channel: 'SMS', message: 'Hi {name}, following up on the surplus funds we mentioned. The claim deadline is approaching. Reply STOP to opt out.' },
]

function OutreachForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ channel: 'SMS', message: '', leadId: searchParams.get('leadId') || '', caseId: searchParams.get('caseId') || '', scheduledAt: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.message.trim()) { toast.error('Please enter a message'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/outreach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast.success('Outreach sent!'); router.push('/outreach') }
      else toast.error('Failed to send outreach')
    } catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <label className="label">Channel</label>
        <div className="grid grid-cols-4 gap-2">
          {['SMS', 'EMAIL', 'VOICEMAIL', 'CALL'].map(ch => (
            <button key={ch} type="button" onClick={() => setForm({ ...form, channel: ch })} className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-colors ${form.channel === ch ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{ch}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Message *</label>
        <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input h-36 resize-none" placeholder="Enter your message. Use {name} for recipient name..." />
        <div className="text-xs text-gray-400 mt-1">{form.message.length} chars · Variables: {'{name}'}, {'{phone}'}, {'{surplus}'}</div>
      </div>
      <div>
        <label className="label">Schedule (optional)</label>
        <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className="input" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Sending...' : form.scheduledAt ? 'Schedule' : 'Send Now'}
        </button>
        <Link href="/outreach" className="btn-secondary px-6 py-3">Cancel</Link>
      </div>
    </form>
  )
}

export default function NewOutreachPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/outreach" className="btn-secondary text-sm py-2 inline-flex mb-4"><ArrowLeft className="h-4 w-4" /> Back</Link>
          <h1 className="text-2xl font-bold text-gray-900">New Outreach Campaign</h1>
          <p className="text-gray-500 mt-1">Send personalized SMS, email, or voicemail to a lead</p>
        </div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3"><Wand2 className="h-4 w-4 text-brand-600" /><span className="text-sm font-semibold text-gray-700">Quick Templates</span></div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map(t => (
              <button key={t.name} type="button" onClick={() => {}} className="badge border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors cursor-pointer py-1.5 px-3">{t.name}</button>
            ))}
          </div>
        </div>
        <Suspense fallback={<div className="card animate-pulse h-80" />}><OutreachForm /></Suspense>
      </div>
      <div className="h-20 lg:h-0" />
    </DashboardLayout>
  )
}
