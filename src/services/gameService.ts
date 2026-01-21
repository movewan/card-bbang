import { supabase } from '../lib/supabase'
import type { GameRound, CardDraw } from '../types/database'
import { createShuffledDeck } from '../utils/cardDeck'

export async function startGame(roomId: string): Promise<GameRound | null> {
  const { error: roomError } = await supabase
    .from('game_rooms')
    .update({ status: 'playing' })
    .eq('id', roomId)

  if (roomError) {
    console.error('Failed to update room status:', roomError)
    return null
  }

  const shuffledDeck = createShuffledDeck()
  const { data: round, error: roundError } = await supabase
    .from('game_rounds')
    .insert({
      room_id: roomId,
      shuffled_deck: shuffledDeck,
    })
    .select()
    .single()

  if (roundError || !round) {
    console.error('Failed to create round:', roundError)
    return null
  }

  return round as GameRound
}

export async function getCurrentRound(roomId: string): Promise<GameRound | null> {
  const { data, error } = await supabase
    .from('game_rounds')
    .select()
    .eq('room_id', roomId)
    .order('round_number', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Failed to get current round:', error)
    return null
  }

  return data as GameRound
}

export async function drawCard(roundId: string, playerId: string): Promise<CardDraw | null> {
  const { data: round, error: roundError } = await supabase
    .from('game_rounds')
    .select()
    .eq('id', roundId)
    .single()

  if (roundError || !round) {
    console.error('Failed to get round:', roundError)
    return null
  }

  const typedRound = round as GameRound

  const { data: existingDraw } = await supabase
    .from('card_draws')
    .select()
    .eq('round_id', roundId)
    .eq('player_id', playerId)
    .single()

  if (existingDraw) {
    return existingDraw as CardDraw
  }

  const cardIndex = typedRound.next_card_index
  const cardValue = typedRound.shuffled_deck[cardIndex]

  const { data: draw, error: drawError } = await supabase
    .from('card_draws')
    .insert({
      round_id: roundId,
      player_id: playerId,
      card_value: cardValue,
    })
    .select()
    .single()

  if (drawError || !draw) {
    console.error('Failed to draw card:', drawError)
    return null
  }

  await supabase
    .from('game_rounds')
    .update({ next_card_index: cardIndex + 1 })
    .eq('id', roundId)

  return draw as CardDraw
}

export async function getCardDraws(roundId: string): Promise<CardDraw[]> {
  const { data, error } = await supabase
    .from('card_draws')
    .select()
    .eq('round_id', roundId)
    .order('drawn_at', { ascending: true })

  if (error) {
    console.error('Failed to get card draws:', error)
    return []
  }

  return (data || []) as CardDraw[]
}

export async function finishGame(roomId: string): Promise<boolean> {
  const { error } = await supabase
    .from('game_rooms')
    .update({ status: 'finished' })
    .eq('id', roomId)

  if (error) {
    console.error('Failed to finish game:', error)
    return false
  }

  return true
}

export async function resetGame(roomId: string): Promise<boolean> {
  const { error } = await supabase
    .from('game_rooms')
    .update({ status: 'waiting' })
    .eq('id', roomId)

  if (error) {
    console.error('Failed to reset game:', error)
    return false
  }

  await supabase
    .from('players')
    .update({ is_ready: false })
    .eq('room_id', roomId)

  return true
}
