import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '../types/database'
import { getPlayersInRoom } from '../services/roomService'

export function usePlayers(roomId: string | undefined) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      return
    }

    const id = roomId

    async function fetchPlayers() {
      setLoading(true)
      const data = await getPlayersInRoom(id)
      setPlayers(data)
      setLoading(false)
    }

    fetchPlayers()

    const channel = supabase
      .channel(`players:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers((prev) => [...prev, payload.new as Player])
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((prev) =>
              prev.map((p) => (p.id === (payload.new as Player).id ? (payload.new as Player) : p))
            )
          } else if (payload.eventType === 'DELETE') {
            setPlayers((prev) => prev.filter((p) => p.id !== (payload.old as Player).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  return { players, loading }
}
