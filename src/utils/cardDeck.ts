// Fisher-Yates 셔플 알고리즘
export function shuffleDeck(deck: number[]): number[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 1~13 카드 덱 생성 (4명을 위한 충분한 카드)
export function createDeck(): number[] {
  return Array.from({ length: 13 }, (_, i) => i + 1)
}

// 셔플된 덱 생성
export function createShuffledDeck(): number[] {
  return shuffleDeck(createDeck())
}

// 카드 숫자를 표시 문자로 변환
export function getCardDisplay(value: number): string {
  switch (value) {
    case 1:
      return 'A'
    case 11:
      return 'J'
    case 12:
      return 'Q'
    case 13:
      return 'K'
    default:
      return String(value)
  }
}

// 6자리 방 코드 생성
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
