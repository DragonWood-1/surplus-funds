'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Search, Users, Map, ShoppingBag,
  BarChart2, MessageSquare, Settings, DollarSign,
  ChevronLeft, ChevronRight, Bell, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Navbar from './Navbar'

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Surplus Database', href: '/search', icon: Search },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'Outreach', href: '/outreach', icon: MessageSquare },
  { name: 'County Directory', href: '/counties', icon: Map },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Revenue', href: '/revenue', icon: DollarSign },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar - hidden on mobile */}
        <aside className={cn(
          'hidden lg:flex flex-col border-r border-gray-200 bg-white transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)]',
          collapsed ? 'w-16' : 'w-56'
        )}>
          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-2 py-2">
        <div className="flex items-center justify-around">
          {sidebarItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors min-w-0',
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  ? 'text-brand-600'
                  : 'text-gray-500'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
