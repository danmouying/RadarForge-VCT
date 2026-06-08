import { Plus, Trash2 } from 'lucide-react'

export function DimensionEditor({
  dimensions,
  activePerson,
  onAdd,
  onRemove,
  onChangeDimension,
  onChangeScore,
}) {
  return (
    <section className="panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">维度与分数</h2>
          <p className="section-copy">编辑维度名称、区间和当前人物分数；分数可超过上限形成爆表效果。</p>
        </div>
        <button type="button" className="icon-button primary" onClick={onAdd} title="新增维度">
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {dimensions.map((dimension, index) => (
          <div className="dimension-row" key={dimension.id}>
            <div className="grid flex-1 grid-cols-[1fr_76px_76px_88px] gap-3">
              <label className="field">
                <span>名称</span>
                <input
                  value={dimension.name}
                  onChange={(event) => onChangeDimension(dimension.id, 'name', event.target.value)}
                  placeholder={`维度 ${index + 1}`}
                />
              </label>
              <label className="field">
                <span>min</span>
                <input
                  type="number"
                  value={dimension.min ?? 0}
                  onChange={(event) => onChangeDimension(dimension.id, 'min', event.target.value)}
                />
              </label>
              <label className="field">
                <span>max</span>
                <input
                  type="number"
                  value={dimension.max ?? 100}
                  onChange={(event) => onChangeDimension(dimension.id, 'max', event.target.value)}
                />
              </label>
              <label className="field">
                <span>{activePerson?.name || '当前人物'}</span>
                <input
                  type="number"
                  min={dimension.min ?? 0}
                  value={activePerson?.scores[index] ?? 0}
                  onChange={(event) => onChangeScore(activePerson.id, index, event.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => onRemove(dimension.id)}
              title="删除维度"
              disabled={dimensions.length <= 3}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
