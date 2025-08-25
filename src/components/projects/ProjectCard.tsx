import Link from 'next/link'
import { Check, Trash2 } from 'lucide-react'
import { Project } from '@/payload-types'
import { useSelectedProject } from '@/contexts/SelectedProjectContext'

interface ProjectCardProps {
  project: Project
  onDelete?: (projectId: string) => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { selectedProject, selectProject, deselectProject, isProjectSelected } =
    useSelectedProject()
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
    // Use a consistent format that won't cause hydration mismatches
    const date = new Date(dateString)
    const year = date.getFullYear()
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const month = monthNames[date.getMonth()]
    const day = date.getDate()
    return `${month} ${day}, ${year}`
  }

  const handleSelectClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isProjectSelected(project.id)) {
      deselectProject()
    } else {
      selectProject(project)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (onDelete) {
      onDelete(project.id)
    }
  }

  const movieFormat = typeof project.movieFormat === 'object' ? project.movieFormat : null
  const movieStyle = typeof project.movieStyle === 'object' ? project.movieStyle : null

  const isSelected = isProjectSelected(project.id)

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 relative overflow-hidden ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
      }`}
    >
      {/* Action Icons */}
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button
          onClick={handleSelectClick}
          className={`p-2 rounded-full transition-colors shadow-sm ${
            isSelected
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
          }`}
          title={isSelected ? 'Deselect project' : 'Select project'}
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-1 text-red-500 hover:text-red-700 transition-colors"
          title="Delete project"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <Link href={`/project/${project.id}`} className="block h-full">
        <div className="p-6">
          {/* Header with title and status */}
          <div className="mb-4 pr-24">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-3">
              {project.projectTitle || project.name}
            </h3>
            <div className="flex justify-start">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  project.status,
                )}`}
              >
                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
              </span>
            </div>
          </div>
          {/* Description */}
          {project.shortDescription && (
            <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
              {project.shortDescription}
            </p>
          )}

          {/* Project Details */}
          <div className="space-y-3 mb-6">
            {movieFormat && (
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 mr-2 min-w-[60px]">Format:</span>
                <span className="text-gray-600">{movieFormat.name}</span>
              </div>
            )}
            {movieStyle && (
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 mr-2 min-w-[60px]">Style:</span>
                <span className="text-gray-600">{movieStyle.name}</span>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex justify-between items-center text-xs text-gray-400 pt-4 border-t border-gray-100">
            <span>Created: {formatDate(project.createdAt)}</span>
            <span>Updated: {formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
