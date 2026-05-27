import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-brand-600" /> Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-600" /> Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input defaultValue={session.user.name || ''} className="input" />
              </div>
              <div>
                <label className="label">Email</label>
                <input defaultValue={session.user.email || ''} className="input" disabled />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>

          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-600" /> Notifications
            </h2>
            <div className="space-y-3">
              {[
                { label: 'New surplus cases in my states', desc: 'Get notified when new cases match your criteria' },
                { label: 'Claim deadline reminders', desc: '30-day and 7-day warnings before deadlines' },
                { label: 'Lead status updates', desc: 'When CRM leads change status' },
                { label: 'Outreach replies', desc: 'When leads respond to your messages' },
              ].map(n => (
                <div key={n.label} className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{n.label}</div>
                    <div className="text-xs text-gray-400">{n.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-600" /> Security
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <button className="btn-secondary">Update Password</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-600" /> Subscription
            </h3>
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-4">
              <div className="text-sm font-semibold text-brand-700">Current Plan</div>
              <div className="text-2xl font-black text-brand-900 mt-1">
                {(session.user as any).role || 'Free'}
              </div>
              <div className="text-xs text-brand-500 mt-1">Active</div>
            </div>
            <button className="btn-primary w-full">Upgrade Plan</button>
            <button className="btn-secondary w-full mt-2">Manage Billing</button>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900 mb-3">Account Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Role</dt>
                <dd className="font-semibold text-gray-900">{(session.user as any).role}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">User ID</dt>
                <dd className="font-mono text-xs text-gray-500 truncate max-w-[7rem]">
                  {(session.user as any).id}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="h-20 lg:h-0" />
    </DashboardLayout>
  )
}
