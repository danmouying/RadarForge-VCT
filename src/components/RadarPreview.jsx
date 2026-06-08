import ReactECharts from 'echarts-for-react'
import { Download, ImagePlus, Play, Video, X } from 'lucide-react'
import { forwardRef } from 'react'
import { buildRadarOption } from '../utils/chartOptions'
import {
  HERO_ICON_LAYOUT_SINGLE,
  HUPU_RATING_TEMPLATE_JRS,
  buildHeroIconSlots,
  getSingleHeroIcon,
} from '../utils/portraitMeta'

export const RadarPreview = forwardRef(function RadarPreview(
  {
    title,
    dimensions,
    people,
    activePersonId,
    theme,
    onPlay,
    onExport,
    onExportVideo,
    exportRef,
    exportStatus,
    videoDuration,
    onVideoDurationChange,
    isVideoExporting,
    canvasRatio,
    portraitImage,
    hupuRating,
    matchInfo = {},
    battleRank,
    battlePower,
    kda,
    heroIcons,
    heroIconLayout,
    hupuRatingTemplate,
    hupuRatingImage,
    onHupuRatingChange,
    onHupuRatingImageImport,
    onHeroIconImport,
    portraitName,
    portraitAnimationProgress,
    onPortraitImport,
    onPortraitClear,
  },
  ref,
) {
  const option = buildRadarOption({ title, dimensions, people, activePersonId, theme })
  const heroIconSlots = buildHeroIconSlots(heroIcons)
  const singleHeroIcon = getSingleHeroIcon(heroIcons)
  const usesSingleHeroIcon = heroIconLayout === HERO_ICON_LAYOUT_SINGLE
  const usesJrsRating = hupuRatingTemplate === HUPU_RATING_TEMPLATE_JRS
  const hasMatchBar = Boolean(
    matchInfo.leftTeam || matchInfo.leftScore || matchInfo.rightScore || matchInfo.rightTeam,
  )
  const canvasStyle = {
    background: theme.canvas,
    aspectRatio: canvasRatio.aspectRatio,
  }
  const portraitEntryStyle = {
    opacity: portraitAnimationProgress,
    transform: `translateY(${(1 - portraitAnimationProgress) * 16}px) scale(${
      0.94 + portraitAnimationProgress * 0.06
    })`,
  }

  if (canvasRatio.id === '9:16') {
    canvasStyle.height = 'min(72vh, 760px)'
    canvasStyle.width = 'auto'
    canvasStyle.maxWidth = '100%'
  }

  return (
    <section className="preview-shell" style={{ background: theme.canvas }}>
      <div className="preview-toolbar" style={{ color: theme.text }}>
        <div>
          <p>实时预览</p>
          <span style={{ color: theme.muted }}>
            {exportStatus || `${dimensions.length} 个维度 · ${people.length} 人 · ${canvasRatio.label}`}
          </span>
        </div>
        <div className="preview-actions">
          <button type="button" className="action-button" onClick={onPlay}>
            <Play size={17} />
            播放动画
          </button>
          <label className="video-duration-select" title="视频时长">
            <Video size={16} />
            <select
              value={videoDuration}
              onChange={(event) => onVideoDurationChange(Number(event.target.value))}
              disabled={isVideoExporting}
            >
              <option value={5}>5 秒</option>
              <option value={8}>8 秒</option>
              <option value={10}>10 秒</option>
            </select>
          </label>
          <button
            type="button"
            className="action-button"
            onClick={onExportVideo}
            disabled={isVideoExporting}
          >
            <Video size={17} />
            {isVideoExporting ? '录制中...' : '导出动画视频'}
          </button>
          <button type="button" className="action-button primary" onClick={onExport}>
            <Download size={17} />
            导出 PNG
          </button>
        </div>
      </div>
      <div
        className="preview-canvas"
        ref={exportRef}
        style={canvasStyle}
      >
        {hasMatchBar ? (
          <div className="match-bar team-bar" style={{ background: '#800020', color: '#F9F7EA' }}>
            <strong className="match-team match-team-left">{matchInfo.leftTeam || 'EDG'}</strong>
            <span className="match-score">
              <strong>{matchInfo.leftScore || '0'}</strong>
              <span className="match-score-colon">:</span>
              <strong>{matchInfo.rightScore || '0'}</strong>
            </span>
            <strong className="match-team match-team-right">{matchInfo.rightTeam || 'JDG'}</strong>
          </div>
        ) : null}
        <div className="battle-power-card" aria-label="战力表">
          <span className="battle-power-card-title">战力表</span>
          <strong>{battleRank || '#1'}</strong>
          <span className="battle-power-card-value">战斗力 {battlePower || '--'}</span>
        </div>
        <div
          className={`safe-zone ${portraitImage ? 'has-image' : ''}`}
          style={{ borderColor: theme.border, color: theme.muted }}
          data-portrait-progress={portraitAnimationProgress.toFixed(3)}
        >
          <label className="safe-zone-image">
            {portraitImage ? (
              <div
                className="portrait-image-stage"
                style={portraitEntryStyle}
              >
                <img src={portraitImage} alt="人物图像" />
              </div>
            ) : (
              <span>
                <ImagePlus size={18} />
                导入人物图片
              </span>
            )}
            <input type="file" accept="image/*" onChange={onPortraitImport} />
          </label>
          <div className="safe-zone-kda" style={{ color: theme.text }}>
            <span className="safe-zone-person-name">{portraitName || '--'}</span>
            <strong>{kda || '--'}</strong>
          </div>
          <div
            className={`safe-zone-icons ${usesSingleHeroIcon ? 'single-icon-layout' : 'grid-icon-layout'}`}
            aria-label="英雄头像"
            data-hero-icon-layout={usesSingleHeroIcon ? 'single' : 'grid'}
          >
            {(usesSingleHeroIcon ? [singleHeroIcon.icon] : heroIconSlots).map((icon, index) => (
              <label
                className={`safe-zone-icon ${icon ? 'has-icon' : 'is-empty'}`}
                key={`${icon || 'empty'}-${index}`}
                title={usesSingleHeroIcon ? '导入居中英雄头像' : `导入英雄头像 ${index + 1}`}
              >
                {icon ? <img src={icon} alt="" /> : <ImagePlus size={14} />}
                <input
                  type="file"
                  accept="image/*"
                  aria-label={usesSingleHeroIcon ? '导入居中英雄头像' : `导入英雄头像 ${index + 1}`}
                  onChange={(event) => onHeroIconImport(usesSingleHeroIcon ? singleHeroIcon.slotIndex : index, event)}
                />
              </label>
            ))}
          </div>
          <div
            className={`safe-zone-rating ${usesJrsRating ? 'jrs-rating-template' : 'classic-rating-template'}`}
            style={{ color: theme.text }}
            data-hupu-rating-template={usesJrsRating ? 'jrs' : 'classic'}
          >
            {usesJrsRating ? (
              <div className="jrs-rating-heading">
                <span className="jrs-rating-title">虎扑JRs评分</span>
                <strong>{hupuRating || '--'}</strong>
              </div>
            ) : (
              <span style={{ color: theme.muted }}>虎扑评分</span>
            )}
            <select
              aria-label="虎扑评分"
              value={hupuRating}
              onChange={(event) => onHupuRatingChange(event.target.value)}
              style={{ color: theme.accent2 || theme.scoreText }}
            >
              <option value="">--</option>
              {Array.from({ length: 101 }, (_, index) => (index / 10).toFixed(1)).map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
            {usesJrsRating ? null : (
              <strong style={{ color: theme.accent2 || theme.scoreText }}>{hupuRating || '--'}</strong>
            )}
            {usesJrsRating ? (
              <label className={`jrs-rating-image ${hupuRatingImage ? 'has-image' : ''}`}>
                {hupuRatingImage ? <img src={hupuRatingImage} alt="虎扑JRs评分图片" /> : <ImagePlus size={16} />}
                <input
                  type="file"
                  accept="image/*"
                  aria-label="导入虎扑JRs评分图片"
                  onChange={onHupuRatingImageImport}
                />
              </label>
            ) : null}
          </div>
        </div>
        {portraitImage && (
          <button type="button" className="safe-zone-clear" onClick={onPortraitClear} title="移除图片">
            <X size={15} />
          </button>
        )}
        <ReactECharts
          ref={ref}
          option={option}
          notMerge={false}
          lazyUpdate={false}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </section>
  )
})
