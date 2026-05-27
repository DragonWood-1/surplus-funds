import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: 'blue' | 'green' | 'gold' | 'purple' | 'red'
  className?: string
}

const colorMap = {
  blue: { bg: 'bg-brand-50', icon: 'text-brand-600', trend: 'text-brand-600' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', trend: 'text-green-600' },
  gold: { bg: 'bg-gold-50', icon: 'text-gold-600', trend: 'text-gold-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', trend: 'text-purple-600' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', trend: 'text-red-600' },
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue', className }: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5', colors.bg)}>
          <Icon className={cn('h-5 w-5', colors.icon)} />
        </div>
      </div>
      {trend && (
        <div className={cn('flex items-center gap-1 text-sm font-medium', colors.trend)}>
          <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          <span className="text-gray-400 font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
