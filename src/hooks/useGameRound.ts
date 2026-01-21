import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GameRound } from '../types/database'
import { getCurrentRound } from '../services/gameService'

export function useGameRound(roomId: string | undefined) {
  const [round, setRound] = useState<GameRound | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      return
    }

    const id = roomId

    async function fetchRound() {
      setLoading(true)
      const data = await getCurrentRound(id)
      setRound(data)
      setLoading(false)
    }

    fetchRound()

    const channel = supabase
      .channel(`rounds:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rounds',
          filter: `room_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setRound(payload.new as GameRound)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  return { round, loading }
}
