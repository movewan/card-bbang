import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GameCard } from '../components/GameCard'
import { useRoom } from '../hooks/useRoom'
import { usePlayers } from '../hooks/usePlayers'
import { useGameRound } from '../hooks/useGameRound'
import { useCardDraws } from '../hooks/useCardDraws'
import { drawCard, finishGame } from '../services/gameService'
import { getStoredPlayerId } from '../utils/storage'

export function GamePage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { room, loading: roomLoading } = useRoom(roomCode)
  const { players, loading: playersLoading } = usePlayers(room?.id)
  const { round, loading: roundLoading } = useGameRound(room?.id)
  const { draws } = useCardDraws(round?.id)
  const [drawing, setDrawing] = useState(false)

  const currentPlayerId = getStoredPlayerId()

  // Determine loser when all players have drawn
  const allDrawn = players.length > 0 && draws.length === players.length
  const loserDraw = allDrawn
    ? draws.reduce((min, d) => (d.card_value < min.card_value ? d : min), draws[0])
    : null

  useEffect(() => {
    if (room?.status === 'finished') {
      navigate(`/result/${roomCode}`)
    }
  }, [room?.status, roomCode, navigate])

  useEffect(() => {
    if (allDrawn && room && room.status !== 'finished') {
      // Auto finish after a delay
      const timer = setTimeout(() => {
        finishGame(room.id)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [allDrawn, room])

  const handleDraw = async () => {
    if (!round || !currentPlayerId || drawing) return

    setDrawing(true)
    await drawCard(round.id, currentPlayerId)
    setDrawing(false)
  }

  if (roomLoading || playersLoading || roundLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-white text-xl">Loading game...</span>
      </div>
    )
  }

  if (!room || !round) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-white text-xl">Game not found</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Draw Your Card!</h1>
          <p className="text-white/80">
            {allDrawn
              ? 'All cards revealed!'
              : `${draws.length}/${players.length} players have drawn`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {players.map((player) => {
            const draw = draws.find((d) => d.player_id === player.id)
            const isLoser = loserDraw?.player_id === player.id

            return (
              <GameCard
                key={player.id}
                player={player}
                draw={draw}
                isCurrentPlayer={player.id === currentPlayerId}
                isLoser={isLoser}
                onDraw={handleDraw}
                canDraw={!drawing}
              />
            )
          })}
        </div>

        {allDrawn && (
          <div className="mt-8 text-center">
            <p className="text-white text-xl animate-pulse">Revealing results...</p>
          </div>
        )}
      </div>
    </div>
  )
}
