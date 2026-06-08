export function ThemePicker({ themes, activeThemeId, onThemeChange }) {
  return (
    <section className="panel">
      <h2 className="section-title">视觉主题</h2>
      <div className="mt-4 grid gap-2">
        {themes.map((theme) => (
          <button
            type="button"
            className={`theme-option ${activeThemeId === theme.id ? 'active' : ''}`}
            onClick={() => onThemeChange(theme.id)}
            key={theme.id}
          >
            <span className="theme-swatch" style={{ background: theme.canvas }}>
              <i style={{ background: theme.accent }} />
              <i style={{ background: theme.accent2 }} />
            </span>
            <span>
              <strong>{theme.name}</strong>
              <small>{theme.description}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
