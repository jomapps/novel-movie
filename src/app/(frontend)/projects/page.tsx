import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Project } from '@/payload-types'
import ProjectCard from '@/components/projects/ProjectCard'
import EmptyState from '@/components/projects/EmptyState'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProjectsPagination from '@/components/projects/ProjectsPagination'

interface ProjectsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams
  const currentPage = parseInt(resolvedSearchParams.page || '1')

  const headerActions = (
    <Link href="/project/create">
      <Button>Create New Project</Button>
    </Link>
  )

  try {
    const payload = await getPayload({ config })

    const projects = await payload.find({
      collection: 'projects',
      page: currentPage,
      limit: 12,
      sort: '-updatedAt',
      depth: 2, // Include related data like movieFormat and movieStyle
    })

    if (projects.docs.length === 0) {
      return (
        <DashboardLayout
          title="Projects"
          subtitle="Manage your movie projects"
          actions={headerActions}
        >
          <EmptyState />
        </DashboardLayout>
      )
    }

    return (
      <DashboardLayout
        title="Projects"
        subtitle="Manage your movie projects"
        actions={headerActions}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {projects.docs.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {projects.totalPages > 1 && (
          <ProjectsPagination
            currentPage={projects.page}
            totalPages={projects.totalPages}
            hasNextPage={projects.hasNextPage}
            hasPrevPage={projects.hasPrevPage}
          />
        )}
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error fetching projects:', error)
    return (
      <DashboardLayout
        title="Projects"
        subtitle="Manage your movie projects"
        actions={headerActions}
      >
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading projects</h3>
          <p className="text-gray-500 mb-4">Failed to load projects. Please try again later.</p>
          <Link href="/projects">
            <Button>Refresh Page</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }
}
