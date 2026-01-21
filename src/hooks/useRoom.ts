import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GameRoom } from '../types/database'
import { getRoomByCode } from '../services/roomService'

export function useRoom(roomCode: string | undefined) {
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomCode) {
      setLoading(false)
      return
    }

    const code = roomCode

    async function fetchRoom() {
      setLoading(true)
      const data = await getRoomByCode(code)
      if (data) {
        setRoom(data)
      } else {
        setError('Room not found')
      }
      setLoading(false)
    }

    fetchRoom()

    const channel = supabase
      .channel(`room:${code}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `room_code=eq.${code.toUpperCase()}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setRoom(payload.new as GameRoom)
          } else if (payload.eventType === 'DELETE') {
            setRoom(null)
            setError('Room was deleted')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode])

  return { room, loading, error }
}
