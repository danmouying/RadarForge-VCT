import { RotateCcw } from 'lucide-react'

export function AnimationControls({ duration, onDurationChange, onReplay }) {
  return (
    <section className="panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">动画控制</h2>
          <p className="section-copy">调节雷达图从中心展开的生成速度。</p>
        </div>
        <button type="button" className="icon-button primary" onClick={onReplay} title="重新播放">
          <RotateCcw size={17} />
        </button>
      </div>
      <label className="field">
        <span>动画时长：{duration}ms</span>
        <input
          type="range"
          min="500"
          max="3000"
          step="100"
          value={duration}
          onChange={(event) => onDurationChange(Number(event.target.value))}
        />
      </label>
    </section>
  )
}
