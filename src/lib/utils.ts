import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MM/dd/yyyy')
}

export function formatDateLong(date: Date | string): string {
  return format(new Date(date), 'MMMM d, yyyy')
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'HIGH': return 'text-red-600 bg-red-50 border-red-200'
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    default: return 'text-green-600 bg-green-50 border-green-200'
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'text-blue-600 bg-blue-50 border-blue-200',
    ACTIVE: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    CONTACTED: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    VERIFIED: 'text-purple-600 bg-purple-50 border-purple-200',
    SIGNED: 'text-orange-600 bg-orange-50 border-orange-200',
    FILED: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    RECOVERED: 'text-green-600 bg-green-50 border-green-200',
    CLOSED: 'text-gray-600 bg-gray-50 border-gray-200',
    EXPIRED: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200'
}

export function getLeadStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'text-blue-600 bg-blue-50',
    CONTACTED: 'text-yellow-600 bg-yellow-50',
    QUALIFIED: 'text-purple-600 bg-purple-50',
    CONVERTED: 'text-green-600 bg-green-50',
    LOST: 'text-red-600 bg-red-50',
  }
  return colors[status] || 'text-gray-600 bg-gray-50'
}

export function scoreToLabel(score: number): string {
  if (score >= 80) return 'HIGH'
  if (score >= 50) return 'MEDIUM'
  return 'LOW'
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
