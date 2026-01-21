export type GameStatus = 'waiting' | 'playing' | 'finished'

export interface GameRoom {
  id: string
  room_code: string
  status: GameStatus
  host_player_id: string | null
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  room_id: string
  nickname: string
  is_ready: boolean
  joined_at: string
}

export interface GameRound {
  id: string
  room_id: string
  round_number: number
  shuffled_deck: number[]
  next_card_index: number
  created_at: string
}

export interface CardDraw {
  id: string
  round_id: string
  player_id: string
  card_value: number
  drawn_at: string
}

export interface Database {
  public: {
    Tables: {
      game_rooms: {
        Row: GameRoom
        Insert: Omit<GameRoom, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          status?: GameStatus
          host_player_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<GameRoom>
      }
      players: {
        Row: Player
        Insert: Omit<Player, 'id' | 'joined_at'> & {
          id?: string
          is_ready?: boolean
          joined_at?: string
        }
        Update: Partial<Player>
      }
      game_rounds: {
        Row: GameRound
        Insert: Omit<GameRound, 'id' | 'created_at'> & {
          id?: string
          round_number?: number
          next_card_index?: number
          created_at?: string
        }
        Update: Partial<GameRound>
      }
      card_draws: {
        Row: CardDraw
        Insert: Omit<CardDraw, 'id' | 'drawn_at'> & {
          id?: string
          drawn_at?: string
        }
        Update: Partial<CardDraw>
      }
    }
  }
}
