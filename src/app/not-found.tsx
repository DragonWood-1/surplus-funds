import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-8xl font-black text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          The page you're looking for doesn't exist. It may have been moved or deleted.
        </p>
        <div className="flex gap-3">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/search" className="btn-secondary">Search Database</Link>
        </div>
      </div>
    </PublicLayout>
  )
}
