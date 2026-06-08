export function TitleControls({
  matchInfo,
  onMatchLeftTeamChange,
  onMatchLeftScoreChange,
  onMatchRightScoreChange,
  onMatchRightTeamChange,
}) {
  return (
    <section className="panel">
      <h2 className="section-title">顶部比分</h2>
      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-[1fr_72px_72px_1fr] gap-2">
          <label className="field">
            <span>左战队</span>
            <input
              value={matchInfo.leftTeam}
              onChange={(event) => onMatchLeftTeamChange(event.target.value)}
              placeholder="EDG"
            />
          </label>
          <label className="field">
            <span>左比分</span>
            <input
              value={matchInfo.leftScore}
              onChange={(event) => onMatchLeftScoreChange(event.target.value)}
              inputMode="numeric"
              placeholder="2"
            />
          </label>
          <label className="field">
            <span>右比分</span>
            <input
              value={matchInfo.rightScore}
              onChange={(event) => onMatchRightScoreChange(event.target.value)}
              inputMode="numeric"
              placeholder="1"
            />
          </label>
          <label className="field">
            <span>右战队</span>
            <input
              value={matchInfo.rightTeam}
              onChange={(event) => onMatchRightTeamChange(event.target.value)}
              placeholder="JDG"
            />
          </label>
        </div>
      </div>
    </section>
  )
}
