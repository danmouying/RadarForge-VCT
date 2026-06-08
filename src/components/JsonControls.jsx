import { FileDown, FileUp } from 'lucide-react'

export function JsonControls({ onSaveJson, onImportJson }) {
  return (
    <section className="panel">
      <h2 className="section-title">项目文件</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="action-button" onClick={onSaveJson}>
          <FileDown size={17} />
          保存 JSON
        </button>
        <label className="action-button file-button">
          <FileUp size={17} />
          导入 JSON
          <input type="file" accept="application/json,.json" onChange={onImportJson} />
        </label>
      </div>
    </section>
  )
}
