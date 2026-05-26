import { notFound } from 'next/navigation'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate, formatDateLong, getStatusColor, getPriorityColor } from '@/lib/utils'
import {
  MapPin, Calendar, DollarSign, FileText, Phone, Mail,
  Home, User, AlertCircle, Download, ExternalLink,
  ArrowLeft, Shield, Clock, Star, CheckCircle
} from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function getCase(id: string) {
  return prisma.surplusCase.findUnique({
    where: { id },
    include: {
      ownerContacts: true,
      propertyRecords: true,
      claimForms: true,
      documents: true,
    },
  })
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const c = await getCase(params.id)
  if (!c) return { title: 'Case Not Found' }
  return {
    title: `${c.ownerName} – ${formatCurrency(c.surplusAmount)} Surplus | SurplusFlow`,
    description: `Surplus funds case for ${c.ownerName} in ${c.county} County, ${c.state}. Surplus amount: ${formatCurrency(c.surplusAmount)}.`,
  }
}

export default async function SurplusCasePage({ params }: { params: { id: string } }) {
  const [surplusCase, session] = await Promise.all([
    getCase(params.id),
    getServerSession(authOptions),
  ])

  if (!surplusCase) notFound()

  const isPro = session?.user && ['ADMIN', 'PROFESSIONAL', 'STARTER'].includes((session.user as any).role)
  const primaryContact = surplusCase.ownerContacts[0]
  const daysToDeadline = surplusCase.claimDeadline
    ? Math.ceil((new Date(surplusCase.claimDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
          <div className="mx-auto max-w-7xl flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-brand-600">Surplus Database</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{surplusCase.ownerName}</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className={`badge ${getStatusColor(surplusCase.status)}`}>{surplusCase.status}</span>
                <span className={`badge ${getPriorityColor(surplusCase.priority)}`}>{surplusCase.priority} PRIORITY</span>
                {daysToDeadline !== null && daysToDeadline <= 30 && (
                  <span className="badge text-red-600 bg-red-50 border-red-200 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {daysToDeadline}d left to claim
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{surplusCase.ownerName}</h1>
              <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                <MapPin className="h-4 w-4" />
                <span>{surplusCase.county} County, {surplusCase.state}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link href="/search" className="btn-secondary text-sm py-2">
                <ArrowLeft className="h-4 w-4" /> Back to Search
              </Link>
              {isPro && (
                <Link href={`/crm/new?caseId=${surplusCase.id}`} className="btn-gold text-sm py-2">
                  Add to CRM
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Surplus Summary Card */}
              <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">UNCLAIMED SURPLUS AMOUNT</p>
                    <p className="text-5xl font-black text-green-700">{formatCurrency(surplusCase.surplusAmount)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-gray-500">Sale Price: <strong className="text-gray-800">{formatCurrency(surplusCase.salePrice)}</strong></div>
                    <div className="text-sm text-gray-500">Debt Owed: <strong className="text-gray-800">{formatCurrency(surplusCase.debtAmount)}</strong></div>
                    {surplusCase.salePrice > 0 && (
                      <div className="text-sm font-medium text-green-700">
                        {((surplusCase.surplusAmount / surplusCase.salePrice) * 100).toFixed(1)}% surplus rate
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5 text-brand-600" /> Property Details
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Property Address</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {surplusCase.propertyAddress}<br />
                      {surplusCase.city}, {surplusCase.state}
                    </dd>
                  </div>
                  {surplusCase.apn && (
                    <div>
                      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Assessor Parcel Number (APN)</dt>
                      <dd className="font-mono text-sm font-semibold text-gray-900">{surplusCase.apn}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Sale Date</dt>
                    <dd className="text-sm font-semibold text-gray-900">{formatDateLong(surplusCase.saleDate)}</dd>
                  </div>
                  {surplusCase.courtCase && (
                    <div>
                      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Court Case Number</dt>
                      <dd className="font-mono text-sm font-semibold text-gray-900">{surplusCase.courtCase}</dd>
                    </div>
                  )}
                  {surplusCase.claimDeadline && (
                    <div>
                      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Claim Deadline</dt>
                      <dd className={`text-sm font-semibold ${daysToDeadline !== null && daysToDeadline <= 30 ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDateLong(surplusCase.claimDeadline)}
                        {daysToDeadline !== null && (
                          <span className="ml-2 text-xs">({daysToDeadline > 0 ? `${daysToDeadline} days left` : 'EXPIRED'})</span>
                        )}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Score</dt>
                    <dd className="text-sm font-semibold text-gray-900">{surplusCase.score.toFixed(1)}/100</dd>
                  </div>
                </dl>
              </div>

              {/* Contact Information */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-600" /> Contact Information
                  </h2>
                  {!isPro && (
                    <Link href="/pricing" className="badge border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors">
                      🔒 Upgrade to view
                    </Link>
                  )}
                </div>

                {isPro && primaryContact ? (
                  <div className="space-y-4">
                    {primaryContact.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400">Phone Number</div>
                          <div className="font-semibold text-gray-900">{primaryContact.phone}</div>
                        </div>
                        {primaryContact.isVerified && (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-auto" title="Verified" />
                        )}
                      </div>
                    )}
                    {primaryContact.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 text-brand-600 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400">Email Address</div>
                          <div className="font-semibold text-gray-900">{primaryContact.email}</div>
                        </div>
                      </div>
                    )}
                    {primaryContact.knownAddress && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400">Known Address</div>
                          <div className="font-semibold text-gray-900">{primaryContact.knownAddress}</div>
                        </div>
                      </div>
                    )}
                    {primaryContact.aliases && primaryContact.aliases.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-400 mb-2">Known Aliases</div>
                        <div className="flex flex-wrap gap-2">
                          {primaryContact.aliases.map((alias: string, i: number) => (
                            <span key={i} className="badge border-gray-200 text-gray-700">{alias}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {primaryContact.confidence > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${primaryContact.confidence * 100}%` }}
                          />
                        </div>
                        <span>{(primaryContact.confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                    )}
                  </div>
                ) : !isPro ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Contact information is available to paid subscribers</p>
                    <Link href="/pricing" className="btn-primary">Unlock Contact Info</Link>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No contact information available</p>
                )}
              </div>

              {/* Claim Steps */}
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-600" /> How to Claim Surplus Funds
                </h2>
                <div className="space-y-3">
                  {[
                    { step: '1', title: 'File the Claim', desc: `Submit the official claim form to ${surplusCase.county} County Clerk` },
                    { step: '2', title: 'Provide Identification', desc: 'Government-issued photo ID required' },
                    { step: '3', title: 'Prove Ownership', desc: 'Provide deed, tax records, or other proof of ownership' },
                    { step: '4', title: 'Await Court Approval', desc: 'A judge reviews the claim and approves disbursement' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold">
                        {item.step}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Quick actions */}
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {isPro ? (
                    <>
                      <Link href={`/crm/new?caseId=${surplusCase.id}`} className="btn-gold w-full text-center">
                        Add to CRM Pipeline
                      </Link>
                      <Link href={`/outreach/new?caseId=${surplusCase.id}`} className="btn-primary w-full text-center">
                        Send Outreach
                      </Link>
                      <button className="btn-secondary w-full">
                        <Download className="h-4 w-4" /> Export Case
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/register" className="btn-primary w-full text-center">
                        Sign Up to Access Full Case
                      </Link>
                      <Link href="/pricing" className="btn-secondary w-full text-center">
                        View Pricing
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* County Info */}
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-600" /> County Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">County</span>
                    <span className="font-semibold text-gray-900">{surplusCase.county}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">State</span>
                    <span className="font-semibold text-gray-900">{surplusCase.state}</span>
                  </div>
                  {surplusCase.taxCommissionerUrl && (
                    <a
                      href={surplusCase.taxCommissionerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-600 hover:underline mt-2"
                    >
                      Tax Commissioner <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <Link href={`/counties/${surplusCase.state.toLowerCase()}/${surplusCase.county.toLowerCase().replace(/\s+/g, '-')}`} className="block text-brand-600 hover:underline text-sm mt-1">
                    View {surplusCase.county} County directory →
                  </Link>
                </div>
              </div>

              {/* Claim Forms */}
              {surplusCase.claimForms.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-600" /> Official Claim Forms
                  </h3>
                  {surplusCase.claimForms.map((form) => (
                    <a
                      key={form.id}
                      href={form.formUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-brand-600"
                    >
                      <Download className="h-4 w-4" />
                      {form.county} County Claim Form
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  ))}
                </div>
              )}

              {/* Legal disclaimer */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800 mb-1">Legal Notice</p>
                    <p className="text-xs text-amber-700">
                      This data is sourced from public records. SurplusFlow is not a law firm and does not provide legal advice. Contact an attorney for claim assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
