export function TemplateLibrary({ templates, onApplyTemplate }) {
  return (
    <section className="panel">
      <h2 className="section-title">模板库</h2>
      <div className="template-grid mt-4">
        {templates.map((template) => (
          <button
            type="button"
            className="template-card"
            onClick={() => onApplyTemplate(template)}
            key={template.id}
          >
            <strong>{template.name}</strong>
            <span>{template.dimensions.length} 维度 · {template.people.length} 人</span>
          </button>
        ))}
      </div>
    </section>
  )
}
