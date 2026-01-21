import { getCardDisplay } from '../utils/cardDeck'

interface CardProps {
  value?: number
  isFlipped: boolean
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-16 h-24 text-xl',
  md: 'w-24 h-36 text-3xl',
  lg: 'w-32 h-48 text-4xl',
}

export function Card({ value, isFlipped, onClick, disabled, size = 'md' }: CardProps) {
  const sizeClass = sizeClasses[size]

  return (
    <div
      className={`card ${sizeClass} ${isFlipped ? 'flipped' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className={`card-face card-back ${sizeClass}`}>
        <span className="text-white font-bold">?</span>
      </div>
      <div className={`card-face card-front ${sizeClass}`}>
        {value !== undefined && (
          <span
            className={`font-bold ${
              value === 1 ? 'text-red-500' : value >= 11 ? 'text-purple-600' : 'text-gray-800'
            }`}
          >
            {getCardDisplay(value)}
          </span>
        )}
      </div>
    </div>
  )
}
