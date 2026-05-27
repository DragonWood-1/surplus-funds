'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function NewLeadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get('caseId')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    source: 'DIRECT',
    notes: '',
    caseId: caseId || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success('Lead added to CRM')
        router.push(`/crm/${data.id}`)
      } else {
        toast.error('Failed to add lead')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">First Name *</label>
          <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="input" placeholder="John" />
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="input" placeholder="Smith" />
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="john@example.com" />
      </div>
      <div>
        <label className="label">Phone</label>
        <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="(404) 555-1234" />
      </div>
      <div>
        <label className="label">Address</label>
        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input" placeholder="123 Main St, Atlanta GA" />
      </div>
      <div>
        <label className="label">Lead Source</label>
        <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="input">
          <option value="DIRECT">Direct</option>
          <option value="WEBSITE">Website</option>
          <option value="REFERRAL">Referral</option>
          <option value="SEO">SEO</option>
          <option value="PAID_ADS">Paid Ads</option>
          <option value="DATABASE">Database</option>
        </select>
      </div>
      {caseId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">Linked to surplus case: <strong>{caseId}</strong></p>
        </div>
      )}
      <div>
        <label className="label">Notes</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input h-24 resize-none" placeholder="Any additional notes..." />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Adding...' : 'Add to CRM'}
        </button>
        <Link href="/crm" className="btn-secondary px-6 py-3">Cancel</Link>
      </div>
    </form>
  )
}

export default function NewLeadPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/crm" className="btn-secondary text-sm py-2 inline-flex mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to CRM
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
          <p className="text-gray-500 mt-1">Add a potential surplus claimant to your CRM pipeline</p>
        </div>
        <Suspense fallback={<div className="card animate-pulse h-96" />}>
          <NewLeadForm />
        </Suspense>
      </div>
      <div className="h-20 lg:h-0" />
    </DashboardLayout>
  )
}
