import { ReactNode } from 'react'

interface DashboardCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function DashboardCard({ 
  title, 
  subtitle, 
  children, 
  actions, 
  className = '', 
  padding = 'md' 
}: DashboardCardProps) {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return ''
      case 'sm':
        return 'p-4'
      case 'md':
        return 'p-6'
      case 'lg':
        return 'p-8'
      default:
        return 'p-6'
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || subtitle || actions) && (
        <div className={`border-b border-gray-200 ${getPaddingClasses()}`}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={title || subtitle || actions ? getPaddingClasses() : getPaddingClasses()}>
        {children}
      </div>
    </div>
  )
}
