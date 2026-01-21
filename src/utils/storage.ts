const PLAYER_ID_KEY = 'card-bbang-player-id'
const PLAYER_NAME_KEY = 'card-bbang-player-name'

export function getStoredPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY)
}

export function setStoredPlayerId(id: string): void {
  localStorage.setItem(PLAYER_ID_KEY, id)
}

export function getStoredPlayerName(): string | null {
  return localStorage.getItem(PLAYER_NAME_KEY)
}

export function setStoredPlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name)
}

export function clearStoredPlayer(): void {
  localStorage.removeItem(PLAYER_ID_KEY)
  localStorage.removeItem(PLAYER_NAME_KEY)
}
