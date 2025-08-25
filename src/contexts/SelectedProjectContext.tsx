'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Project } from '@/payload-types'

interface SelectedProjectContextType {
  selectedProject: Project | null
  selectProject: (project: Project) => void
  deselectProject: () => void
  isProjectSelected: (projectId: string) => boolean
}

const SelectedProjectContext = createContext<SelectedProjectContextType | undefined>(undefined)

interface SelectedProjectProviderProps {
  children: ReactNode
}

export function SelectedProjectProvider({ children }: SelectedProjectProviderProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Load selected project from localStorage on mount
  useEffect(() => {
    const savedProject = localStorage.getItem('selectedProject')
    if (savedProject) {
      try {
        const project = JSON.parse(savedProject)
        setSelectedProject(project)
      } catch (error) {
        console.error('Error parsing saved project:', error)
        localStorage.removeItem('selectedProject')
      }
    }
  }, [])

  // Save selected project to localStorage when it changes
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProject', JSON.stringify(selectedProject))
    } else {
      localStorage.removeItem('selectedProject')
    }
  }, [selectedProject])

  const selectProject = (project: Project) => {
    setSelectedProject(project)
  }

  const deselectProject = () => {
    setSelectedProject(null)
  }

  const isProjectSelected = (projectId: string) => {
    return selectedProject?.id === projectId
  }

  const contextValue: SelectedProjectContextType = {
    selectedProject,
    selectProject,
    deselectProject,
    isProjectSelected,
  }

  return (
    <SelectedProjectContext.Provider value={contextValue}>
      {children}
    </SelectedProjectContext.Provider>
  )
}

export function useSelectedProject() {
  const context = useContext(SelectedProjectContext)
  if (context === undefined) {
    throw new Error('useSelectedProject must be used within a SelectedProjectProvider')
  }
  return context
}
