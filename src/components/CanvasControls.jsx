export function CanvasControls({ ratios, activeRatioId, onRatioChange }) {
  return (
    <section className="panel">
      <h2 className="section-title">画布比例</h2>
      <div className="segmented mt-4">
        {ratios.map((ratio) => (
          <button
            type="button"
            className={activeRatioId === ratio.id ? 'active' : ''}
            onClick={() => onRatioChange(ratio.id)}
            key={ratio.id}
          >
            {ratio.label}
          </button>
        ))}
      </div>
    </section>
  )
}
