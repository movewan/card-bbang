import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CardDraw } from '../types/database'
import { getCardDraws } from '../services/gameService'

export function useCardDraws(roundId: string | undefined) {
  const [draws, setDraws] = useState<CardDraw[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roundId) {
      setLoading(false)
      return
    }

    const id = roundId

    async function fetchDraws() {
      setLoading(true)
      const data = await getCardDraws(id)
      setDraws(data)
      setLoading(false)
    }

    fetchDraws()

    const channel = supabase
      .channel(`draws:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'card_draws',
          filter: `round_id=eq.${id}`,
        },
        (payload) => {
          setDraws((prev) => [...prev, payload.new as CardDraw])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roundId])

  return { draws, loading }
}
