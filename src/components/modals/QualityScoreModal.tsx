'use client'

import { useState, useEffect } from 'react'
import { X, Star, RefreshCw, Edit3, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Textarea from '@/components/forms/Textarea'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface QualityScoreModalProps {
  isOpen: boolean
  onClose: () => void
  qualityScore?: number
  recommendations?: string
  loading?: boolean
  onRescore: (editedRecommendations: string) => void
  onRegenerate: (recommendations: string) => void
}

export default function QualityScoreModal({
  isOpen,
  onClose,
  qualityScore,
  recommendations,
  loading = false,
  onRescore,
  onRegenerate,
}: QualityScoreModalProps) {
  const [editedRecommendations, setEditedRecommendations] = useState(recommendations || '')
  const [isRescoring, setIsRescoring] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Update edited recommendations when new recommendations come in
  useEffect(() => {
    if (recommendations) {
      setEditedRecommendations(recommendations)
    }
  }, [recommendations])

  if (!isOpen) return null

  const handleRescore = async () => {
    setIsRescoring(true)
    try {
      await onRescore(editedRecommendations)
    } finally {
      setIsRescoring(false)
    }
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      await onRegenerate(editedRecommendations)
    } finally {
      setIsRegenerating(false)
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score?: number) => {
    if (!score) return 'Pending'
    if (score >= 90) return 'Exceptional'
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Quality Assessment</h2>
              <p className="text-sm text-gray-600">
                AI-powered evaluation by seasoned industry experts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading || isRescoring || isRegenerating}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" className="mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Project Quality</h3>
              <p className="text-gray-600 text-center max-w-md">
                Our AI experts are evaluating your project from multiple perspectives including
                market viability, creative coherence, and production feasibility...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quality Score Display */}
              {qualityScore !== undefined && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Overall Quality Score
                      </h3>
                      <p className="text-sm text-gray-600">
                        Based on industry standards and market analysis
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(qualityScore)}`}>
                        {qualityScore}/100
                      </div>
                      <div className={`text-sm font-medium ${getScoreColor(qualityScore)}`}>
                        {getScoreLabel(qualityScore)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Expert Recommendations</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed feedback and actionable suggestions to enhance your project's potential.
                  You can edit these recommendations and re-run the assessment.
                </p>

                <Textarea
                  value={editedRecommendations}
                  onChange={(e) => setEditedRecommendations(e.target.value)}
                  placeholder="AI recommendations will appear here..."
                  rows={12}
                  className="w-full"
                  disabled={loading || isRescoring || isRegenerating}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleRescore}
                  disabled={
                    loading || isRescoring || isRegenerating || !editedRecommendations.trim()
                  }
                  loading={isRescoring}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Manual Edit & Rescore
                </Button>

                <Button
                  onClick={handleRegenerate}
                  disabled={
                    loading || isRescoring || isRegenerating || !editedRecommendations.trim()
                  }
                  loading={isRegenerating}
                  variant="primary"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Regenerate
                </Button>
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  How to use these options:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    <strong>Manual Edit & Rescore:</strong> Edit the recommendations above and
                    re-run the quality assessment
                  </li>
                  <li>
                    <strong>AI Regenerate:</strong> Use the current recommendations to regenerate
                    and improve your form fields
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading || isRescoring || isRegenerating}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
