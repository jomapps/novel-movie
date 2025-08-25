'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/forms/Input'
import Textarea from '@/components/forms/Textarea'
import FormField from '@/components/forms/FormField'

interface CreateSeriesModalProps {
  isOpen: boolean
  onClose: () => void
  onSeriesCreated: (series: { id: string; name: string }) => void
}

interface SeriesFormData {
  name: string
  description: string
}

interface SeriesFormErrors {
  [key: string]: string
}

export default function CreateSeriesModal({
  isOpen,
  onClose,
  onSeriesCreated,
}: CreateSeriesModalProps) {
  const [formData, setFormData] = useState<SeriesFormData>({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<SeriesFormErrors>({})
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: keyof SeriesFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: SeriesFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Series name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/v1/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          isActive: true,
        }),
      })

      const result = await response.json()

      if (result.success && result.doc) {
        onSeriesCreated({
          id: result.doc.id,
          name: result.doc.name,
        })
        handleClose()
      } else {
        setErrors({ submit: result.error || 'Failed to create series' })
      }
    } catch (err) {
      console.error('Error creating series:', err)
      setErrors({ submit: 'Failed to create series. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', description: '' })
    setErrors({})
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Create New Series
                  </h3>

                  <div className="space-y-4">
                    <FormField
                      label="Series Name"
                      required
                      error={errors.name}
                      description="The name/title of the series"
                    >
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter series name"
                        error={!!errors.name}
                      />
                    </FormField>

                    <FormField
                      label="Description"
                      error={errors.description}
                      description="Brief description of the series concept"
                    >
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter series description"
                        rows={3}
                        error={!!errors.description}
                      />
                    </FormField>

                    {errors.submit && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="text-red-600 text-sm">{errors.submit}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" loading={loading} className="w-full sm:w-auto sm:ml-3">
                Create Series
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
