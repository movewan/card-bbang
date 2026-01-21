import { supabase } from '../lib/supabase'
import type { GameRoom, Player } from '../types/database'
import { generateRoomCode } from '../utils/cardDeck'

export async function createRoom(): Promise<{ room: GameRoom } | null> {
  const roomCode = generateRoomCode()

  const { data: room, error: roomError } = await supabase
    .from('game_rooms')
    .insert({ room_code: roomCode })
    .select()
    .single()

  if (roomError || !room) {
    console.error('Failed to create room:', roomError)
    return null
  }

  return { room: room as GameRoom }
}

export async function joinRoom(
  roomCode: string,
  nickname: string
): Promise<{ room: GameRoom; player: Player } | null> {
  const { data: room, error: roomError } = await supabase
    .from('game_rooms')
    .select()
    .eq('room_code', roomCode.toUpperCase())
    .single()

  if (roomError || !room) {
    console.error('Room not found:', roomError)
    return null
  }

  const typedRoom = room as GameRoom

  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', typedRoom.id)

  if (count !== null && count >= 4) {
    console.error('Room is full')
    return null
  }

  if (typedRoom.status !== 'waiting') {
    console.error('Game already started')
    return null
  }

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      room_id: typedRoom.id,
      nickname: nickname.trim(),
    })
    .select()
    .single()

  if (playerError || !player) {
    console.error('Failed to create player:', playerError)
    return null
  }

  const typedPlayer = player as Player

  if (count === 0 || count === null) {
    await supabase
      .from('game_rooms')
      .update({ host_player_id: typedPlayer.id })
      .eq('id', typedRoom.id)
  }

  return { room: typedRoom, player: typedPlayer }
}

export async function getRoomByCode(roomCode: string): Promise<GameRoom | null> {
  const { data, error } = await supabase
    .from('game_rooms')
    .select()
    .eq('room_code', roomCode.toUpperCase())
    .single()

  if (error) {
    console.error('Failed to get room:', error)
    return null
  }

  return data as GameRoom
}

export async function getPlayersInRoom(roomId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select()
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Failed to get players:', error)
    return []
  }

  return (data || []) as Player[]
}

export async function updatePlayerReady(playerId: string, isReady: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('players')
    .update({ is_ready: isReady })
    .eq('id', playerId)

  if (error) {
    console.error('Failed to update ready status:', error)
    return false
  }

  return true
}

export async function leaveRoom(playerId: string): Promise<boolean> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId)

  if (error) {
    console.error('Failed to leave room:', error)
    return false
  }

  return true
}
