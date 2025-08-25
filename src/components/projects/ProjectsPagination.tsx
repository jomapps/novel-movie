import Link from 'next/link'
import Button from '@/components/ui/Button'

interface ProjectsPaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function ProjectsPagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
}: ProjectsPaginationProps) {
  return (
    <div className="flex justify-center items-center space-x-4">
      {hasPrevPage ? (
        <Link href={`/projects?page=${currentPage - 1}`}>
          <Button variant="outline">Previous</Button>
        </Link>
      ) : (
        <Button variant="outline" disabled>
          Previous
        </Button>
      )}
      
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      
      {hasNextPage ? (
        <Link href={`/projects?page=${currentPage + 1}`}>
          <Button variant="outline">Next</Button>
        </Link>
      ) : (
        <Button variant="outline" disabled>
          Next
        </Button>
      )}
    </div>
  )
}
