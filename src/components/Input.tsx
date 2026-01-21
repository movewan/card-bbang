import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-white">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none text-gray-800 text-lg ${className}`}
        {...props}
      />
    </div>
  )
}
