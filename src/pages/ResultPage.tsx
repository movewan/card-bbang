import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useRoom } from '../hooks/useRoom'
import { usePlayers } from '../hooks/usePlayers'
import { useGameRound } from '../hooks/useGameRound'
import { useCardDraws } from '../hooks/useCardDraws'
import { resetGame } from '../services/gameService'
import { getStoredPlayerId } from '../utils/storage'
import { getCardDisplay } from '../utils/cardDeck'

export function ResultPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { room, loading: roomLoading } = useRoom(roomCode)
  const { players, loading: playersLoading } = usePlayers(room?.id)
  const { round, loading: roundLoading } = useGameRound(room?.id)
  const { draws } = useCardDraws(round?.id)

  const currentPlayerId = getStoredPlayerId()
  const isHost = room?.host_player_id === currentPlayerId

  // Find loser
  const loserDraw = draws.length > 0
    ? draws.reduce((min, d) => (d.card_value < min.card_value ? d : min), draws[0])
    : null
  const loser = loserDraw ? players.find((p) => p.id === loserDraw.player_id) : null

  const handlePlayAgain = async () => {
    if (room) {
      await resetGame(room.id)
      navigate(`/room/${roomCode}`)
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  if (roomLoading || playersLoading || roundLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-white text-xl">Loading results...</span>
      </div>
    )
  }

  // Sort draws by card value for display
  const sortedResults = [...draws]
    .map((draw) => ({
      ...draw,
      player: players.find((p) => p.id === draw.player_id),
    }))
    .sort((a, b) => a.card_value - b.card_value)

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Result!</h1>
          {loser && (
            <div className="bg-red-500 rounded-xl p-6 shadow-2xl">
              <p className="text-white text-xl mb-2">The loser is...</p>
              <p className="text-white text-4xl font-bold animate-bounce">{loser.nickname}</p>
              <p className="text-white/80 mt-2">Pay for lunch!</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-white font-semibold text-center">All Results</h2>
          {sortedResults.map((result, index) => (
            <div
              key={result.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index === 0 ? 'bg-red-400/50 border-2 border-red-500' : 'bg-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-xl">#{index + 1}</span>
                <span className="text-white font-medium">
                  {result.player?.nickname}
                  {result.player?.id === currentPlayerId && ' (You)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Card value={result.card_value} isFlipped={true} size="sm" />
                <span className="text-white font-bold text-2xl">
                  {getCardDisplay(result.card_value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {isHost && (
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handlePlayAgain}
            >
              Play Again!
            </Button>
          )}
          <Button variant="secondary" size="md" className="w-full" onClick={handleGoHome}>
            Go Home
          </Button>
        </div>

        {!isHost && (
          <p className="text-center text-white/70 text-sm">
            Waiting for host to start a new game...
          </p>
        )}
      </div>
    </div>
  )
}
