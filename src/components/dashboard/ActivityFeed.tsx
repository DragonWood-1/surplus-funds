import { formatRelative } from '@/lib/utils'

interface Activity {
  id: string
  type: string
  description: string
  createdAt: Date
}

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-4">No recent activity</p>
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-brand-400" />
          <div>
            <p className="text-sm text-gray-700">{activity.description}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatRelative(activity.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
