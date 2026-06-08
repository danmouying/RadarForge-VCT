export const HERO_ICON_SLOT_COUNT = 6
export const HERO_ICON_LAYOUT_GRID = 'grid'
export const HERO_ICON_LAYOUT_SINGLE = 'single'
export const HERO_ICON_LAYOUTS = [HERO_ICON_LAYOUT_GRID, HERO_ICON_LAYOUT_SINGLE]
export const HUPU_RATING_TEMPLATE_CLASSIC = 'classic'
export const HUPU_RATING_TEMPLATE_JRS = 'jrs'
export const HUPU_RATING_TEMPLATES = [HUPU_RATING_TEMPLATE_CLASSIC, HUPU_RATING_TEMPLATE_JRS]

export function normalizeHupuRating(value) {
  if (value === '' || value == null) return ''
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  return clampNumber(number, 0, 10, 0).toFixed(1)
}

export function normalizeHeroIcons(value) {
  if (Array.isArray(value)) {
    const items = value
      .slice(0, HERO_ICON_SLOT_COUNT)
      .map((item) => String(item || '').trim())

    if (items.some(Boolean) && items.some((item) => !item)) {
      return Array.from({ length: HERO_ICON_SLOT_COUNT }, (_, index) => items[index] || '')
    }

    return items.filter(Boolean).slice(0, HERO_ICON_SLOT_COUNT)
  }

  if (typeof value !== 'string') return []

  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, HERO_ICON_SLOT_COUNT)
}

export function normalizeHeroIconLayout(value) {
  return HERO_ICON_LAYOUTS.includes(value) ? value : HERO_ICON_LAYOUT_GRID
}

export function normalizeHupuRatingTemplate(value) {
  return HUPU_RATING_TEMPLATES.includes(value) ? value : HUPU_RATING_TEMPLATE_CLASSIC
}

export function serializeHeroIcons(value) {
  return normalizeHeroIcons(value).filter(Boolean).join('|')
}

export function buildHeroIconSlots(heroIcons = []) {
  const icons = normalizeHeroIcons(heroIcons)
  const slots = Array(HERO_ICON_SLOT_COUNT).fill(null)

  if (icons.length === HERO_ICON_SLOT_COUNT) {
    return icons.map((icon) => icon || null)
  }

  if (icons.length === 1) {
    slots[4] = icons[0]
    return slots
  }

  icons.forEach((icon, index) => {
    slots[index] = icon
  })

  return slots
}

export function updateHeroIconSlot(heroIcons, slotIndex, nextIcon) {
  const slots = buildHeroIconSlots(heroIcons).map((icon) => icon || '')
  if (slotIndex < 0 || slotIndex >= HERO_ICON_SLOT_COUNT) return slots
  slots[slotIndex] = nextIcon || ''
  return slots
}

export function getSingleHeroIcon(heroIcons = []) {
  const slots = buildHeroIconSlots(heroIcons)
  const slotIndex = slots.findIndex(Boolean)

  return {
    icon: slotIndex >= 0 ? slots[slotIndex] : '',
    slotIndex: slotIndex >= 0 ? slotIndex : 4,
  }
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value)
  if (Number.isNaN(number)) return fallback
  return Math.min(max, Math.max(min, number))
}
