'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Select from '../forms/Select'
import Button from './Button'

interface SelectWithCreateProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  error?: boolean
  onCreateClick: () => void
  createLabel?: string
  createIcon?: React.ReactNode
}

export default function SelectWithCreate({
  value,
  onChange,
  options,
  placeholder,
  error,
  onCreateClick,
  createLabel = 'Create New',
  createIcon,
}: SelectWithCreateProps) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          options={options}
          placeholder={placeholder}
          error={error}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCreateClick}
        className="flex-shrink-0 px-3"
        title={createLabel}
      >
        {createIcon || <Plus className="w-4 h-4" />}
      </Button>
    </div>
  )
}
