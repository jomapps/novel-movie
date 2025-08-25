import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Get started by creating your first movie project. You can choose from various formats and styles to bring your vision to life.
      </p>
      <Link href="/project/create">
        <Button size="lg">Create Your First Project</Button>
      </Link>
    </div>
  )
}
