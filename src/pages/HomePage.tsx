import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { createRoom, joinRoom } from '../services/roomService'
import { setStoredPlayerId, setStoredPlayerName } from '../utils/storage'

export function HomePage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'home' | 'join' | 'create'>('home')
  const [nickname, setNickname] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!nickname.trim()) {
      setError('Please enter your nickname')
      return
    }

    setLoading(true)
    setError('')

    const result = await createRoom()
    if (result) {
      const joinResult = await joinRoom(result.room.room_code, nickname)
      if (joinResult) {
        setStoredPlayerId(joinResult.player.id)
        setStoredPlayerName(nickname)
        navigate(`/room/${result.room.room_code}`)
      } else {
        setError('Failed to join room')
      }
    } else {
      setError('Failed to create room')
    }

    setLoading(false)
  }

  const handleJoin = async () => {
    if (!nickname.trim()) {
      setError('Please enter your nickname')
      return
    }
    if (!roomCode.trim()) {
      setError('Please enter room code')
      return
    }

    setLoading(true)
    setError('')

    const result = await joinRoom(roomCode, nickname)
    if (result) {
      setStoredPlayerId(result.player.id)
      setStoredPlayerName(nickname)
      navigate(`/room/${result.room.room_code}`)
    } else {
      setError('Failed to join room. Check the code or room may be full.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">Card Bbang</h1>
          <p className="text-white/80">Draw the lowest card? Pay for lunch!</p>
        </div>

        {mode === 'home' && (
          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setMode('create')}
            >
              Create Room
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => setMode('join')}
            >
              Join Room
            </Button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <Input
              label="Your Nickname"
              placeholder="Enter nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
            />
            {error && <p className="text-red-200 text-sm">{error}</p>}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create & Join'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => {
                setMode('home')
                setError('')
              }}
            >
              Back
            </Button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <Input
              label="Your Nickname"
              placeholder="Enter nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
            />
            <Input
              label="Room Code"
              placeholder="Enter 6-digit code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            {error && <p className="text-red-200 text-sm">{error}</p>}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleJoin}
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => {
                setMode('home')
                setError('')
              }}
            >
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
