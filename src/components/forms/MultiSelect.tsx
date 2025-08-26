'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  value: string[]
  onChange: (values: string[]) => void
  options: Option[]
  placeholder?: string
  maxSelections?: number
  error?: boolean
  disabled?: boolean
}

export default function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Select options...',
  maxSelections,
  error = false,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get selected option labels
  const selectedOptions = options.filter(option => value.includes(option.value))

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      // Remove option
      onChange(value.filter(v => v !== optionValue))
    } else {
      // Add option (check max selections)
      if (!maxSelections || value.length < maxSelections) {
        onChange([...value, optionValue])
      }
    }
  }

  const handleRemoveOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue))
  }

  const baseClasses = `
    relative w-full min-h-[42px] px-3 py-2 border rounded-md shadow-sm 
    focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 
    bg-white cursor-pointer
  `
  const errorClasses = error ? 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500' : 'border-gray-300'
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed' : ''

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`${baseClasses} ${errorClasses} ${disabledClasses}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 items-center min-h-[26px]">
          {/* Selected options as tags */}
          {selectedOptions.map(option => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveOption(option.value)
                }}
                className="hover:bg-blue-200 rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          {/* Placeholder or search input */}
          {selectedOptions.length === 0 && !isOpen && (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
          
          {isOpen && (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
              placeholder="Search options..."
              autoFocus
            />
          )}
        </div>

        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
          ) : (
            filteredOptions.map(option => {
              const isSelected = value.includes(option.value)
              const isDisabled = !isSelected && maxSelections && value.length >= maxSelections
              
              return (
                <div
                  key={option.value}
                  onClick={() => !isDisabled && handleToggleOption(option.value)}
                  className={`
                    px-3 py-2 text-sm cursor-pointer transition-colors
                    ${isSelected 
                      ? 'bg-blue-50 text-blue-700' 
                      : isDisabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })
          )}
          
          {/* Max selections message */}
          {maxSelections && value.length >= maxSelections && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
              Maximum {maxSelections} selection{maxSelections > 1 ? 's' : ''} reached
            </div>
          )}
        </div>
      )}
    </div>
  )
}
