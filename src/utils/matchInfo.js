export function normalizeMatchInfo(source = {}) {
  const legacyParts = parseLegacyTeamName(source.teamName)

  return {
    leftTeam: normalizeText(source.matchLeftTeam ?? source.leftTeamName ?? source.leftTeam ?? legacyParts.leftTeam),
    leftScore: normalizeScore(source.matchLeftScore ?? source.leftScore ?? legacyParts.leftScore),
    rightScore: normalizeScore(source.matchRightScore ?? source.rightScore ?? legacyParts.rightScore),
    rightTeam: normalizeText(source.matchRightTeam ?? source.rightTeamName ?? source.rightTeam ?? legacyParts.rightTeam),
  }
}

export function formatMatchTitle(matchInfo = {}) {
  const normalized = normalizeMatchInfo(matchInfo)
  const scoreText =
    normalized.leftScore || normalized.rightScore
      ? `${normalized.leftScore || '0'}:${normalized.rightScore || '0'}`
      : ''
  return [normalized.leftTeam, scoreText, normalized.rightTeam].filter(Boolean).join(' ')
}

function parseLegacyTeamName(value) {
  const text = normalizeText(value)
  if (!text) {
    return {
      leftTeam: 'EDG',
      leftScore: '2',
      rightScore: '1',
      rightTeam: 'JDG',
    }
  }

  const match = text.match(/^\s*(.*?)\s+(\d+)\s*[:：]\s*(\d+)\s+(.*?)\s*$/)
  if (!match) {
    return {
      leftTeam: text,
      leftScore: '',
      rightScore: '',
      rightTeam: '',
    }
  }

  return {
    leftTeam: match[1],
    leftScore: match[2],
    rightScore: match[3],
    rightTeam: match[4],
  }
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeScore(value) {
  const text = normalizeText(String(value ?? ''))
  return text.replace(/[^\d]/g, '').slice(0, 2)
}
