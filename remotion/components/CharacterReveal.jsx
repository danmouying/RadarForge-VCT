import { Img, interpolate, staticFile } from 'remotion'
import { landscapeTemplateTokens } from '../../src/config/templateTokens.js'
import {
  HERO_ICON_LAYOUT_SINGLE,
  HUPU_RATING_TEMPLATE_JRS,
  buildHeroIconSlots,
  getSingleHeroIcon,
} from '../../src/utils/portraitMeta.js'

export function CharacterReveal({
  image,
  name,
  hupuRating,
  kda,
  heroIcons = [],
  heroIconLayout,
  hupuRatingTemplate,
  hupuRatingImage,
  progress,
  theme,
}) {
  const tokens = landscapeTemplateTokens
  const portrait = tokens.portrait
  const width = tokens.width * portrait.widthRatio
  const left = tokens.width - portrait.right - width
  const height = tokens.height - portrait.top - portrait.bottom
  const sectionTop = portrait.top + (portrait.groupOffsetY || 0)
  const imageWidth = width * portrait.imageWidthRatio
  const baseImageHeight = height * portrait.imageHeightRatio
  const imageHeight = baseImageHeight + (portrait.imageExtraHeight || 0)
  const imageTop = portrait.top + (portrait.imageOffsetY || 0)
  const imageLeft = left + (width - imageWidth) / 2
  const iconSlots = buildHeroIconSlots(heroIcons)
  const usesSingleHeroIcon = heroIconLayout === HERO_ICON_LAYOUT_SINGLE
  const usesJrsRating = hupuRatingTemplate === HUPU_RATING_TEMPLATE_JRS
  const gridImageKdaOffsetY = usesSingleHeroIcon ? 0 : (portrait.gridImageKdaOffsetY || 0)
  const singleHeroIcon = getSingleHeroIcon(heroIcons).icon
  const displayIconSlots = usesSingleHeroIcon ? [singleHeroIcon] : iconSlots
  const hasHeroIcons = displayIconSlots.some(Boolean)
  const iconColumns = portrait.iconColumns || 3
  const iconRows = portrait.iconRows || 2
  const displayIconColumns = usesSingleHeroIcon ? 1 : iconColumns
  const displayIconRows = usesSingleHeroIcon ? 1 : iconRows
  const displayIconSize = usesSingleHeroIcon ? portrait.singleIconSize : portrait.iconSize
  const iconGridWidth = displayIconSize * displayIconColumns + portrait.iconGap * (displayIconColumns - 1)
  const iconsHeight = hasHeroIcons ? displayIconSize * displayIconRows + portrait.iconGap * (displayIconRows - 1) : 0
  const reservedGap = hasHeroIcons
    ? usesSingleHeroIcon
      ? (portrait.singleRatingGap ?? 28)
      : (portrait.gridRatingGap ?? 10)
    : 84
  const defaultKdaTop = imageTop + imageHeight + (portrait.imageToKdaGap ?? 14)
  const defaultIconOffsetY = usesSingleHeroIcon
    ? (portrait.singleIconOffsetY ?? portrait.iconGridOffsetY)
    : portrait.iconGridOffsetY
  const defaultIconsTop =
    defaultKdaTop + portrait.kdaHeight + portrait.iconsTopGap + (defaultIconOffsetY || 0)
  const defaultRatingTop =
    (hasHeroIcons
      ? defaultIconsTop + iconsHeight + reservedGap
      : defaultKdaTop + portrait.kdaHeight + reservedGap) + (portrait.ratingOffsetY || 0)
  const pinnedJrsRatingTop = tokens.height - (portrait.jrsRatingBottom ?? 15) - portrait.jrsRatingHeight
  const ratingTop = usesJrsRating ? pinnedJrsRatingTop : defaultRatingTop
  const jrsHeroKdaOffsetY = usesJrsRating ? (portrait.jrsHeroKdaOffsetY || 0) : 0
  const iconsTop =
    usesJrsRating && hasHeroIcons
      ? ratingTop - reservedGap - iconsHeight + jrsHeroKdaOffsetY
      : defaultIconsTop
  const kdaTop =
    usesJrsRating && hasHeroIcons
      ? iconsTop - (portrait.iconsToKdaGap ?? 10) - portrait.kdaHeight + (portrait.jrsNameKdaOffsetY || 0)
      : defaultKdaTop
  const scale = interpolate(progress, [0, 1], [portrait.entryScaleFrom, 1])
  const translateY = interpolate(progress, [0, 1], [portrait.entryOffsetY, 0])
  const portraitImageSrc = resolveRemotionImageSrc(image)
  const hupuRatingImageSrc = resolveRemotionImageSrc(hupuRatingImage)

  return (
    <section
      style={{
        position: 'absolute',
        top: sectionTop,
        left,
        width,
        height,
        color: theme.text,
        overflow: 'visible',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: imageLeft - left,
          top: imageTop - sectionTop + gridImageKdaOffsetY,
          width: imageWidth,
          height: imageHeight,
          overflow: 'hidden',
          opacity: progress,
          transform: `translateY(${translateY}px) scale(${scale})`,
          transformOrigin: '50% 50%',
        }}
      >
        {portraitImageSrc ? (
          <Img
            src={portraitImageSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 18%',
              transform: `scale(${portrait.imageZoom})`,
            }}
          />
        ) : (
          <FallbackPortrait name={name} theme={theme} />
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          top: kdaTop - sectionTop + gridImageKdaOffsetY,
          left: 0,
          right: 0,
          height: portrait.kdaHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: usesJrsRating ? 15 : 5,
          textAlign: 'center',
          opacity: progress,
          transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
        }}
      >
        <span
          style={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: theme.text,
            fontSize: portrait.playerNameFontSize,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: 0,
            textShadow: `0 5px 10px ${theme.shadow}`,
            transform: `translateY(${portrait.playerNameOffsetY || 0}px)`,
          }}
        >
          {name || '--'}
        </span>
        <strong
          style={{
            color: theme.text,
            fontSize: portrait.kdaFontSize,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: 0,
            textShadow: `0 5px 10px ${theme.shadow}`,
            transform: `translateY(${portrait.kdaOffsetY || 0}px)`,
          }}
        >
          {kda || '--'}
        </strong>
      </div>
      {hasHeroIcons ? (
        <div
          style={{
            position: 'absolute',
            top: iconsTop - sectionTop,
            left: (width - iconGridWidth) / 2,
            width: iconGridWidth,
            display: 'grid',
            gridTemplateColumns: `repeat(${displayIconColumns}, ${displayIconSize}px)`,
            gap: portrait.iconGap,
            opacity: progress,
            transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
          }}
        >
          {displayIconSlots.map((icon, index) => (
            <div
              key={`${icon || 'empty'}-${index}`}
              style={{
                width: displayIconSize,
                height: displayIconSize,
                overflow: 'hidden',
                borderRadius: usesSingleHeroIcon ? 14 : 10,
                background: icon ? theme.panelSoft : 'transparent',
                boxShadow: icon
                  ? `inset 0 0 0 3px rgba(255,255,255,0.18), 0 8px 16px ${theme.shadow}`
                  : 'none',
              }}
            >
              {icon ? (
                <Img
                  src={resolveRemotionImageSrc(icon)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: usesJrsRating
            ? (width - portrait.jrsRatingWidth) / 2 + (portrait.jrsRatingOffsetX || 0)
            : 0,
          right: usesJrsRating ? undefined : 0,
          top: ratingTop - sectionTop,
          width: usesJrsRating ? portrait.jrsRatingWidth : undefined,
          height: usesJrsRating ? portrait.jrsRatingHeight : portrait.ratingHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: usesJrsRating ? 10 : 4,
          textAlign: 'center',
          padding: usesJrsRating ? 0 : 0,
          borderTop: 'none',
          borderRadius: 0,
          background: 'transparent',
          boxSizing: 'border-box',
          opacity: progress,
          transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
        }}
      >
        {usesJrsRating ? (
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr auto auto 1fr',
              alignItems: 'center',
              gap: 10,
              color: '#ff8a66',
              fontSize: portrait.jrsRatingTitleFontSize,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: 0,
              textShadow: '0 2px 0 rgba(0, 0, 0, 0.28)',
              transform: `translateX(${portrait.jrsRatingHeadingOffsetX || 0}px)`,
            }}
          >
            <span
              style={{
                height: 6,
                background: '#111827',
                transform: `scaleX(${portrait.jrsRatingLeftLineScale ?? 1})`,
                transformOrigin: '100% 50%',
              }}
            />
            <span>虎扑JRs评分</span>
            <strong
              style={{
                color: '#ff8a66',
                fontSize: portrait.jrsRatingTitleFontSize,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: 0,
              }}
            >
              {hupuRating || '--'}
            </strong>
            <span style={{ height: 6, background: '#111827' }} />
          </div>
        ) : (
          <>
            <span
              style={{
                color: theme.muted,
                fontSize: portrait.ratingLabelFontSize,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: 0,
              }}
            >
              虎扑评分
            </span>
            <strong
              style={{
                color: theme.accent2 || theme.scoreText,
                fontSize: portrait.ratingValueFontSize,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: 0,
              }}
            >
              {hupuRating || '--'}
            </strong>
          </>
        )}
        {usesJrsRating ? (
          <div
            style={{
              width: '96%',
              height:
                portrait.jrsRatingWidth *
                (portrait.jrsRatingImageWidthRatio ?? 0.96) /
                (portrait.jrsRatingImageAspectRatio ?? (1178 / 327)),
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 7,
              background: '#ffffff',
              color: 'rgba(15, 23, 42, 0.34)',
              boxSizing: 'border-box',
              overflow: 'hidden',
              transform: `translateX(${portrait.jrsRatingImageOffsetX || 0}px)`,
            }}
          >
            {hupuRatingImageSrc ? (
              <Img
                src={hupuRatingImageSrc}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function resolveRemotionImageSrc(value) {
  if (typeof value !== 'string') return ''

  const src = value.trim()
  if (!src) return ''
  if (/^(?:data:|https?:|blob:)/i.test(src)) return src

  return staticFile(src.replace(/^public\//, '').replace(/^\/+/, ''))
}

function FallbackPortrait({ name, theme }) {
  const initial = name?.trim()?.[0] || 'R'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(145deg, ${theme.accentSoft}, ${theme.accent2Soft})`,
        color: theme.accent,
        fontSize: 180,
        fontWeight: 900,
      }}
    >
      {initial}
    </div>
  )
}
