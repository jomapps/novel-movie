import Link from 'next/link'
import { Project } from '@/payload-types'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const movieFormat = typeof project.movieFormat === 'object' ? project.movieFormat : null
  const movieStyle = typeof project.movieStyle === 'object' ? project.movieStyle : null

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {project.projectTitle || project.name}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              project.status
            )}`}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
          </span>
        </div>

        {project.shortDescription && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {project.shortDescription}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {movieFormat && (
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">Format:</span>
              <span>{movieFormat.name}</span>
            </div>
          )}
          {movieStyle && (
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">Style:</span>
              <span>{movieStyle.name}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Created: {formatDate(project.createdAt)}</span>
          <span>Updated: {formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
