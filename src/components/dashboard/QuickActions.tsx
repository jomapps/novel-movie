import Link from 'next/link'
import Button from '@/components/ui/Button'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange'
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      title: 'Create New Project',
      description: 'Start a new movie project',
      href: '/project/create',
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      title: 'Upload Media',
      description: 'Add images, videos, or audio',
      href: '/media/upload',
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      title: 'Generate Script',
      description: 'AI-powered script generation',
      href: '/script/generate',
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      title: 'View Analytics',
      description: 'Project performance insights',
      href: '/analytics',
      color: 'orange',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      case 'green':
        return 'bg-green-50 text-green-600 hover:bg-green-100'
      case 'purple':
        return 'bg-purple-50 text-purple-600 hover:bg-purple-100'
      case 'orange':
        return 'bg-orange-50 text-orange-600 hover:bg-orange-100'
      default:
        return 'bg-gray-50 text-gray-600 hover:bg-gray-100'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link key={action.title} href={action.href}>
          <div className={`p-6 rounded-lg border border-gray-200 transition-colors duration-200 cursor-pointer ${getColorClasses(action.color)}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">{action.title}</h3>
                <p className="text-xs opacity-75 mt-1">{action.description}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
