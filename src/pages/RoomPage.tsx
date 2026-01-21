import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { PlayerList } from '../components/PlayerList'
import { useRoom } from '../hooks/useRoom'
import { usePlayers } from '../hooks/usePlayers'
import { updatePlayerReady, leaveRoom } from '../services/roomService'
import { startGame } from '../services/gameService'
import { getStoredPlayerId } from '../utils/storage'

export function RoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { room, loading: roomLoading, error: roomError } = useRoom(roomCode)
  const { players, loading: playersLoading } = usePlayers(room?.id)

  const currentPlayerId = getStoredPlayerId()
  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const isHost = room?.host_player_id === currentPlayerId
  const allReady = players.length >= 2 && players.every((p) => p.is_ready)

  useEffect(() => {
    if (room?.status === 'playing') {
      navigate(`/game/${roomCode}`)
    }
  }, [room?.status, roomCode, navigate])

  const handleReady = async () => {
    if (currentPlayerId) {
      await updatePlayerReady(currentPlayerId, !currentPlayer?.is_ready)
    }
  }

  const handleStart = async () => {
    if (room) {
      await startGame(room.id)
    }
  }

  const handleLeave = async () => {
    if (currentPlayerId) {
      await leaveRoom(currentPlayerId)
      navigate('/')
    }
  }

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
    }
  }

  if (roomLoading || playersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-white text-xl">Loading...</span>
      </div>
    )
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="text-white text-xl">Room not found</span>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Waiting Room</h1>
          <div
            className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/30"
            onClick={copyRoomCode}
          >
            <span className="text-white font-mono text-2xl">{roomCode}</span>
            <span className="text-white/70 text-sm">(tap to copy)</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-white font-semibold">Players ({players.length}/4)</h2>
          <PlayerList
            players={players}
            hostId={room.host_player_id}
            currentPlayerId={currentPlayerId}
          />
        </div>

        <div className="space-y-3">
          {currentPlayer && (
            <Button
              variant={currentPlayer.is_ready ? 'danger' : 'primary'}
              size="lg"
              className="w-full"
              onClick={handleReady}
            >
              {currentPlayer.is_ready ? 'Cancel Ready' : 'Ready!'}
            </Button>
          )}

          {isHost && (
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleStart}
              disabled={!allReady}
            >
              {allReady ? 'Start Game!' : 'Waiting for all players...'}
            </Button>
          )}

          <Button variant="secondary" size="md" className="w-full" onClick={handleLeave}>
            Leave Room
          </Button>
        </div>

        {!isHost && (
          <p className="text-center text-white/70 text-sm">
            Waiting for host to start the game...
          </p>
        )}
      </div>
    </div>
  )
}
