import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  error?: boolean
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options, placeholder, ...props }, ref) => {
    const baseClasses =
      'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white'
    const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''

    return (
      <select ref={ref} className={`${baseClasses} ${errorClasses} ${className}`} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  },
)

Select.displayName = 'Select'

export default Select
