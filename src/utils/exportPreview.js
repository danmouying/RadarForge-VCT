export async function composePreviewPng(previewNode, theme) {
  const outputCanvas = await composePreviewCanvas(previewNode, theme, { scale: 3 })
  return outputCanvas.toDataURL('image/png')
}

export async function composePreviewCanvas(
  previewNode,
  theme,
  { scale = 3, outputWidth, outputHeight } = {},
) {
  const sourceCanvas = previewNode.querySelector('canvas[data-zr-dom-id]')
  if (!sourceCanvas) {
    throw new Error('Radar chart canvas was not found.')
  }

  const previewRect = previewNode.getBoundingClientRect()
  const sourceRect = sourceCanvas.getBoundingClientRect()
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = outputWidth ?? Math.round(previewRect.width * scale)
  outputCanvas.height = outputHeight ?? Math.round(previewRect.height * scale)

  const context = outputCanvas.getContext('2d')
  context.scale(outputCanvas.width / previewRect.width, outputCanvas.height / previewRect.height)
  context.fillStyle = theme.canvas
  context.fillRect(0, 0, previewRect.width, previewRect.height)

  context.drawImage(
    sourceCanvas,
    sourceRect.left - previewRect.left,
    sourceRect.top - previewRect.top,
    sourceRect.width,
    sourceRect.height,
  )

  await drawSafeZoneOverlay(context, previewNode, previewRect, theme)
  drawBattlePowerOverlay(context, previewNode, previewRect)
  drawTeamBarOverlay(context, previewNode, previewRect)

  return outputCanvas
}

function drawBattlePowerOverlay(context, previewNode, previewRect) {
  const card = previewNode.querySelector('.battle-power-card')
  if (!card) return

  const rect = card.getBoundingClientRect()
  const x = rect.left - previewRect.left
  const y = rect.top - previewRect.top
  const styles = getComputedStyle(card)
  const title = card.querySelector('.battle-power-card-title')?.textContent?.trim() || '战力表'
  const rank = card.querySelector('strong')?.textContent?.trim() || '#1'
  const value = card.querySelector('.battle-power-card-value')?.textContent?.trim() || '战斗力 --'
  const radius = Number.parseFloat(styles.borderRadius) || 6

  context.save()
  context.shadowColor = 'rgba(15, 23, 42, 0.13)'
  context.shadowBlur = 16
  context.shadowOffsetY = 6
  drawRoundedRect(context, x, y, rect.width, rect.height, radius)
  context.fillStyle = '#ffffff'
  context.fill()
  context.shadowColor = 'transparent'
  context.strokeStyle = 'rgba(15, 23, 42, 0.12)'
  context.lineWidth = 1
  context.stroke()
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.fillStyle = '#111827'
  context.font = `900 ${Math.max(10, rect.height * 0.2)}px Inter, system-ui, sans-serif`
  context.fillText(title, x + rect.width * 0.12, y + rect.height * 0.2, rect.width * 0.76)
  context.fillStyle = '#800020'
  context.font = `950 ${Math.max(18, rect.height * 0.38)}px Inter, system-ui, sans-serif`
  context.fillText(rank, x + rect.width * 0.12, y + rect.height * 0.52, rect.width * 0.76)
  context.fillStyle = '#111827'
  context.font = `900 ${Math.max(10, rect.height * 0.18)}px Inter, system-ui, sans-serif`
  context.fillText(value, x + rect.width * 0.12, y + rect.height * 0.8, rect.width * 0.76)
  context.restore()
}

function drawTeamBarOverlay(context, previewNode, previewRect) {
  const teamBar = previewNode.querySelector('.team-bar')
  if (!teamBar) return

  const rect = teamBar.getBoundingClientRect()
  const x = rect.left - previewRect.left
  const y = rect.top - previewRect.top
  const styles = getComputedStyle(teamBar)
  const leftTeam = teamBar.querySelector('.match-team-left')?.textContent?.trim() || ''
  const rightTeam = teamBar.querySelector('.match-team-right')?.textContent?.trim() || ''
  const scoreParts = [...teamBar.querySelectorAll('.match-score strong')].map((node) => node.textContent?.trim() || '')

  context.save()
  context.fillStyle = styles.backgroundColor || '#f3eadb'
  context.fillRect(x, y, rect.width, rect.height)
  context.shadowColor = 'rgba(15, 23, 42, 0.12)'
  context.shadowBlur = 8
  context.shadowOffsetY = 3
  context.fillStyle = styles.color || '#111827'
  context.textBaseline = 'middle'
  drawMatchBarText(context, {
    x,
    y,
    width: rect.width,
    height: rect.height,
    leftTeam,
    leftScore: scoreParts[0] || '0',
    rightScore: scoreParts[1] || '0',
    rightTeam,
  })
  context.restore()
}

function drawMatchBarText(context, { x, y, width, height, leftTeam, leftScore, rightScore, rightTeam }) {
  const centerX = x + width / 2
  const centerY = y + height / 2
  const teamFontSize = Math.max(28, Math.min(56, height * 0.62))
  const scoreFontSize = Math.max(34, Math.min(64, height * 0.7))
  const scoreNumberWidth = Math.max(24, scoreFontSize * 0.62)
  const colonWidth = Math.max(8, scoreFontSize * 0.24)
  const teamGap = Math.max(18, width * 0.035)
  const scoreLeftX = centerX - colonWidth / 2 - scoreNumberWidth / 2
  const scoreRightX = centerX + colonWidth / 2 + scoreNumberWidth / 2

  context.font = `900 ${scoreFontSize}px Inter, system-ui, sans-serif`
  context.textAlign = 'center'
  context.fillText(leftScore, scoreLeftX, centerY, scoreNumberWidth)
  context.fillText(':', centerX, centerY, colonWidth)
  context.fillText(rightScore, scoreRightX, centerY, scoreNumberWidth)

  context.font = `900 ${teamFontSize}px Inter, system-ui, sans-serif`
  context.textAlign = 'right'
  context.fillText(leftTeam, centerX - colonWidth / 2 - scoreNumberWidth - teamGap, centerY, width * 0.36)
  context.textAlign = 'left'
  context.fillText(rightTeam, centerX + colonWidth / 2 + scoreNumberWidth + teamGap, centerY, width * 0.36)
}

async function drawSafeZoneOverlay(context, previewNode, previewRect, theme) {
  const zone = previewNode.querySelector('.safe-zone')
  if (!zone) return

  const zoneRect = zone.getBoundingClientRect()
  const x = zoneRect.left - previewRect.left
  const y = zoneRect.top - previewRect.top
  const width = zoneRect.width
  const height = zoneRect.height
  const imageSlot = zone.querySelector('.safe-zone-image')
  const imageRect = imageSlot?.getBoundingClientRect()
  const rating = zone.querySelector('.safe-zone-rating')
  const kda = zone.querySelector('.safe-zone-kda')
  const icons = [...zone.querySelectorAll('.safe-zone-icon img')].slice(0, 6)
  const ratingRect = rating?.getBoundingClientRect()
  const kdaRect = kda?.getBoundingClientRect()
  const imageX = imageRect ? imageRect.left - previewRect.left : x + 12
  const imageY = imageRect ? imageRect.top - previewRect.top : y + 94
  const imageWidth = imageRect ? imageRect.width : width - 24
  const imageHeight = imageRect ? imageRect.height : Math.max(0, height - 106)
  const portraitProgress = clampNumber(Number(zone.dataset.portraitProgress), 0, 1, 1)

  const portrait = zone.querySelector('.portrait-image-stage img')
  if (portrait?.src) {
    const entryScale = 0.94 + portraitProgress * 0.06
    const entryOffsetY = (1 - portraitProgress) * 16
    const scaledWidth = imageWidth * entryScale
    const scaledHeight = imageHeight * entryScale
    const scaledX = imageX + (imageWidth - scaledWidth) / 2
    const scaledY = imageY + (imageHeight - scaledHeight) / 2 + entryOffsetY
    await drawCoverImage(
      context,
      portrait.src,
      scaledX,
      scaledY,
      scaledWidth,
      scaledHeight,
      0,
      1.04,
      portraitProgress,
      0.18,
    )
  }

  if (kdaRect) {
    const kdaX = kdaRect.left - previewRect.left + kdaRect.width / 2
    const nameNode = kda.querySelector('.safe-zone-person-name')
    const kdaValueNode = kda.querySelector('strong')
    const nameRect = nameNode?.getBoundingClientRect()
    const kdaValueRect = kdaValueNode?.getBoundingClientRect()
    const portraitName = nameNode?.textContent?.trim() || '--'
    const kdaValue = kdaValueNode?.textContent?.trim() || '--'
    const nameStyle = nameNode ? getComputedStyle(nameNode) : null
    const kdaValueStyle = kdaValueNode ? getComputedStyle(kdaValueNode) : null

    drawCenteredText(context, portraitName, {
      x: kdaX,
      y: nameRect ? nameRect.top - previewRect.top + nameRect.height / 2 : kdaRect.top - previewRect.top + kdaRect.height * 0.35,
      color: theme.text,
      font: buildCanvasFont(nameStyle, '900 24px Inter, system-ui, sans-serif'),
      alpha: 1,
    })
    drawCenteredText(context, kdaValue, {
      x: kdaX,
      y: kdaValueRect ? kdaValueRect.top - previewRect.top + kdaValueRect.height / 2 : kdaRect.top - previewRect.top + kdaRect.height * 0.68,
      color: theme.text,
      font: buildCanvasFont(kdaValueStyle, '900 24px Inter, system-ui, sans-serif'),
      alpha: 1,
    })
  }

  for (const icon of icons) {
    const iconRect = icon.getBoundingClientRect()
    await drawCoverImage(
      context,
      icon.src,
      iconRect.left - previewRect.left,
      iconRect.top - previewRect.top,
      iconRect.width,
      iconRect.height,
      6,
      1,
      1,
    )
  }

  if (ratingRect) {
    const ratingX = ratingRect.left - previewRect.left + ratingRect.width / 2
    const ratingY = ratingRect.top - previewRect.top
    const ratingX0 = ratingRect.left - previewRect.left
    const ratingValue = rating.querySelector('strong')?.textContent?.trim() || '--'
    const isJrsRating = rating.dataset.hupuRatingTemplate === 'jrs'
    const ratingImage = rating.querySelector('.jrs-rating-image img')

    if (isJrsRating) {
      await drawJrsRatingCard(context, {
        x: ratingX0,
        y: ratingY,
        width: ratingRect.width,
        value: ratingValue,
        imageSrc: ratingImage?.src || '',
      })
    } else {
      drawCenteredText(context, '虎扑评分', {
        x: ratingX,
        y: ratingY + 10,
        color: theme.muted,
        font: '800 16px Inter, system-ui, sans-serif',
        alpha: 1,
      })
      drawCenteredText(context, ratingValue, {
        x: ratingX,
        y: ratingY + 34,
        color: theme.accent2 || theme.scoreText || theme.text,
        font: '900 22px Inter, system-ui, sans-serif',
        alpha: 1,
      })
    }
  }

  if (!portrait?.src) {
    drawCenteredText(context, '导入人物图片', {
      x: imageX + imageWidth / 2,
      y: imageY + imageHeight / 2,
      color: theme.muted,
      font: '800 13px Inter, system-ui, sans-serif',
      alpha: 0.5,
    })
  }
}

function buildCanvasFont(style, fallback) {
  if (!style) return fallback

  const weight = style.fontWeight || '900'
  const size = style.fontSize || '24px'
  const family = style.fontFamily || 'Inter, system-ui, sans-serif'
  return `${weight} ${size} ${family}`
}

async function drawJrsRatingCard(context, { x, y, width, value, imageSrc }) {
  const headingY = y + 12
  const headingText = '虎扑JRs评分'
  const headingValue = value
  context.save()
  context.font = '900 18px Inter, system-ui, sans-serif'
  const headingTextWidth = context.measureText(headingText).width
  const headingValueWidth = context.measureText(headingValue).width
  const headingGap = 5
  const headingTotalWidth = headingTextWidth + headingValueWidth + headingGap
  const headingOffsetX = 10
  const headingLeft = x + (width - headingTotalWidth) / 2 + headingOffsetX
  const lineGap = 8
  const leftLineInset = width * 0.08
  const leftLineEnd = headingLeft - lineGap
  const rightLineStart = headingLeft + headingTotalWidth + lineGap
  context.strokeStyle = '#111827'
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(x + leftLineInset + headingOffsetX, headingY)
  context.lineTo(leftLineEnd, headingY)
  context.moveTo(rightLineStart, headingY)
  context.lineTo(x + width + headingOffsetX, headingY)
  context.stroke()
  context.fillStyle = '#ff8a66'
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.fillText(headingText, headingLeft, headingY)
  context.fillText(headingValue, headingLeft + headingTextWidth + headingGap, headingY)
  context.restore()

  const imageWidth = width * 0.96
  const imageX = x + (width - imageWidth) / 2 + 10
  const imageY = y + 30
  const imageHeight = imageWidth * (327 / 1178)
  context.save()
  drawRoundedRect(context, imageX, imageY, imageWidth, imageHeight, 4)
  context.fillStyle = '#ffffff'
  context.fill()
  context.restore()

  if (imageSrc) {
    await drawContainImage(context, imageSrc, imageX, imageY, imageWidth, imageHeight, 4)
  }
}

async function drawContainImage(context, src, x, y, width, height, radius) {
  const image = await loadImage(src)
  const imageRatio = image.width / image.height
  const targetRatio = width / height
  const drawWidth = imageRatio > targetRatio ? width : height * imageRatio
  const drawHeight = imageRatio > targetRatio ? width / imageRatio : height
  const drawX = x + (width - drawWidth) / 2
  const drawY = y + (height - drawHeight) / 2

  context.save()
  drawRoundedRect(context, x, y, width, height, radius)
  context.clip()
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight)
  context.restore()
}

async function drawCoverImage(context, src, x, y, width, height, radius, zoom = 1, alpha = 1, focusY = 0.5) {
  const image = await loadImage(src)
  const imageRatio = image.width / image.height
  const targetRatio = width / height
  const baseSourceWidth = imageRatio > targetRatio ? image.height * targetRatio : image.width
  const baseSourceHeight = imageRatio > targetRatio ? image.height : image.width / targetRatio
  const sourceWidth = baseSourceWidth / zoom
  const sourceHeight = baseSourceHeight / zoom
  const sourceX = (image.width - sourceWidth) / 2
  const sourceY = (image.height - sourceHeight) * clampNumber(focusY, 0, 1, 0.5)

  context.save()
  context.globalAlpha = alpha
  drawRoundedRect(context, x, y, width, height, radius)
  context.clip()
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
  context.restore()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function drawCenteredText(context, text, { x, y, color, font, alpha }) {
  context.save()
  context.globalAlpha = alpha
  context.fillStyle = color
  context.font = font
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, x, y)
  context.restore()
}

function drawRoundedRect(context, x, y, width, height, radius) {
  const size = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + size, y)
  context.lineTo(x + width - size, y)
  context.quadraticCurveTo(x + width, y, x + width, y + size)
  context.lineTo(x + width, y + height - size)
  context.quadraticCurveTo(x + width, y + height, x + width - size, y + height)
  context.lineTo(x + size, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - size)
  context.lineTo(x, y + size)
  context.quadraticCurveTo(x, y, x + size, y)
  context.closePath()
}

function clampNumber(value, min, max, fallback) {
  if (Number.isNaN(value)) return fallback
  return Math.min(max, Math.max(min, value))
}
