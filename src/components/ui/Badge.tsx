import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cn(
      'badge',
      variants[variant],
      size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs',
      className
    )}>
      {children}
    </span>
  )
}
