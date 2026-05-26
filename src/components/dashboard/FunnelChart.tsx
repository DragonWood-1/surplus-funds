'use client'

interface FunnelItem {
  label: string
  value: number
  color: string
}

export default function FunnelChart({ data }: { data: FunnelItem[] }) {
  const max = data[0]?.value || 1

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = (item.value / max) * 100
        const convRate = i > 0 ? ((item.value / data[i - 1].value) * 100).toFixed(0) : '100'
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                {i > 0 && <span className="text-xs text-gray-400">{convRate}% conv.</span>}
                <span className="font-bold text-gray-900">{item.value.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-6 rounded-md overflow-hidden bg-gray-100">
              <div
                className="h-full rounded-md transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
