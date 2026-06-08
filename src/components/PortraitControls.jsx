import { ImagePlus, X } from 'lucide-react'

export function PortraitControls({
  activePersonName,
  hasPortraitImage,
  hupuRating,
  kda,
  heroIconsText,
  heroIconLayout,
  hupuRatingTemplate,
  onHupuRatingChange,
  onHupuRatingTemplateChange,
  onKdaChange,
  onHeroIconsChange,
  onHeroIconLayoutChange,
  onImageImport,
  onImageClear,
}) {
  const ratingOptions = Array.from({ length: 101 }, (_, index) => (index / 10).toFixed(1))

  return (
    <section className="panel">
      <div className="mb-4">
        <h2 className="section-title">人物图文</h2>
        <p className="section-copy">{activePersonName} 的名称可在多人对比里填写，并显示在 KDA 上方。</p>
      </div>
      <div className="grid gap-3">
        <label className="field">
          <span>KDA</span>
          <input
            value={kda}
            onChange={(event) => onKdaChange(event.target.value)}
            placeholder="1/3/3"
          />
        </label>
        <label className="field">
          <span>英雄头像 heroIcons</span>
          <input
            value={heroIconsText}
            onChange={(event) => onHeroIconsChange(event.target.value)}
            placeholder="image/rumble.jpg|image/ahri.jpg"
          />
        </label>
        <label className="field">
          <span>英雄头像模板</span>
          <select
            value={heroIconLayout}
            onChange={(event) => onHeroIconLayoutChange(event.target.value)}
          >
            <option value="grid">六宫格</option>
            <option value="single">单图居中</option>
          </select>
        </label>
        <label className="field">
          <span>虎扑评分</span>
          <select
            value={hupuRating}
            onChange={(event) => onHupuRatingChange(event.target.value)}
          >
            <option value="">未设置</option>
            {ratingOptions.map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>虎扑评分模板</span>
          <select
            value={hupuRatingTemplate}
            onChange={(event) => onHupuRatingTemplateChange(event.target.value)}
          >
            <option value="classic">仅显示评分</option>
            <option value="jrs">JRs 评分卡</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="action-button file-button">
            <ImagePlus size={17} />
            导入图片
            <input type="file" accept="image/*" onChange={onImageImport} />
          </label>
          <button
            type="button"
            className="action-button"
            onClick={onImageClear}
            disabled={!hasPortraitImage}
          >
            <X size={17} />
            移除图片
          </button>
        </div>
      </div>
    </section>
  )
}
