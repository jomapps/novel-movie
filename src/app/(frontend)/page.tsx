import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/dashboard/StatsCard'
import DashboardCard from '@/components/dashboard/DashboardCard'
import QuickActions from '@/components/dashboard/QuickActions'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Get some basic stats (you can expand this with real data)
  const projectsCount = await payload.count({ collection: 'projects' })
  const mediaCount = await payload.count({ collection: 'media' })

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome to Novel Movie - AI-powered movie production platform"
      showSearch={false}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Projects"
          value={projectsCount.totalDocs}
          change={{ value: '+12%', type: 'increase' }}
          href="/projects"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
        />
        <StatsCard
          title="Media Files"
          value={mediaCount.totalDocs}
          change={{ value: '+8%', type: 'increase' }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Active Projects"
          value="3"
          change={{ value: '2 new', type: 'increase' }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Completed"
          value="12"
          change={{ value: '+3 this week', type: 'increase' }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <DashboardCard
        title="Quick Actions"
        subtitle="Get started with common tasks"
        className="mb-8"
      >
        <QuickActions />
      </DashboardCard>

      {/* Platform Features */}
      <DashboardCard
        title="Platform Features"
        subtitle="Explore what Novel Movie can do for you"
        className="mb-8"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Script Generation</h3>
              <p className="text-sm text-gray-500 mt-1">
                AI-powered screenplay generation from your ideas and concepts.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Media Generation</h3>
              <p className="text-sm text-gray-500 mt-1">
                Automated video and audio generation using advanced AI models.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Project Management</h3>
              <p className="text-sm text-gray-500 mt-1">
                Organize and track your movie projects from concept to completion.
              </p>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* User Welcome Section */}
      {user && (
        <DashboardCard className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.email}!</h2>
            <p className="text-gray-600 mb-6">Ready to continue working on your projects?</p>
            <div className="flex justify-center space-x-4">
              <Link href="/projects">
                <Button>My Projects</Button>
              </Link>
              <a href={payloadConfig.routes.admin} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Admin Panel</Button>
              </a>
            </div>
          </div>
        </DashboardCard>
      )}
    </DashboardLayout>
  )
}
