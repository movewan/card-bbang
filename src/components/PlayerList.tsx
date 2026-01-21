import type { Player } from '../types/database'

interface PlayerListProps {
  players: Player[]
  hostId: string | null
  currentPlayerId: string | null
}

export function PlayerList({ players, hostId, currentPlayerId }: PlayerListProps) {
  return (
    <div className="space-y-2">
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center justify-between p-3 rounded-lg ${
            player.id === currentPlayerId
              ? 'bg-yellow-100 border-2 border-yellow-400'
              : 'bg-white/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{player.nickname}</span>
            {player.id === hostId && (
              <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                HOST
              </span>
            )}
            {player.id === currentPlayerId && (
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                YOU
              </span>
            )}
          </div>
          <div>
            {player.is_ready ? (
              <span className="text-green-600 font-bold">READY</span>
            ) : (
              <span className="text-gray-400">Waiting...</span>
            )}
          </div>
        </div>
      ))}
      {players.length < 4 && (
        <div className="p-3 rounded-lg border-2 border-dashed border-white/50 text-center text-white/70">
          Waiting for players... ({players.length}/4)
        </div>
      )}
    </div>
  )
}
