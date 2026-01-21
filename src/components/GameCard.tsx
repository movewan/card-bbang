import type { Player, CardDraw } from '../types/database'
import { Card } from './Card'

interface GameCardProps {
  player: Player
  draw: CardDraw | undefined
  isCurrentPlayer: boolean
  isLoser: boolean
  onDraw?: () => void
  canDraw: boolean
}

export function GameCard({
  player,
  draw,
  isCurrentPlayer,
  isLoser,
  onDraw,
  canDraw,
}: GameCardProps) {
  const hasDrawn = !!draw

  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${
        isLoser ? 'bg-red-100 border-4 border-red-500' : 'bg-white/20'
      }`}
    >
      <span
        className={`font-bold text-lg ${isLoser ? 'text-red-600' : 'text-white'} ${
          isCurrentPlayer ? 'underline' : ''
        }`}
      >
        {player.nickname}
        {isCurrentPlayer && ' (You)'}
      </span>
      <Card
        value={draw?.card_value}
        isFlipped={hasDrawn}
        onClick={isCurrentPlayer && canDraw && !hasDrawn ? onDraw : undefined}
        disabled={!isCurrentPlayer || !canDraw || hasDrawn}
        size="lg"
      />
      {isCurrentPlayer && !hasDrawn && canDraw && (
        <span className="text-white text-sm animate-pulse">Tap to draw!</span>
      )}
      {isLoser && <span className="text-red-600 font-bold text-xl animate-bounce">LOSER!</span>}
    </div>
  )
}
