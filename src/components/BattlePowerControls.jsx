export function BattlePowerControls({ battleRank, battlePower, onBattleRankChange, onBattlePowerChange }) {
  return (
    <section className="panel">
      <div className="mb-4">
        <h2 className="section-title">战力表</h2>
        <p className="section-copy">左上角白底小表，导出 PNG 时会一起生成。</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="field">
          <span>排名</span>
          <select value={battleRank} onChange={(event) => onBattleRankChange(event.target.value)}>
            {Array.from({ length: 10 }, (_, index) => `#${index + 1}`).map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>战斗力</span>
          <input
            value={battlePower}
            onChange={(event) => onBattlePowerChange(event.target.value)}
            placeholder="9999"
          />
        </label>
      </div>
    </section>
  )
}
