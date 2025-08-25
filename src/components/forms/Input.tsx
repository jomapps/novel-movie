import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
    const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
    
    return (
      <input
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
