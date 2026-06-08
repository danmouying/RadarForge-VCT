import { Plus, Trash2, Users } from 'lucide-react'

export function PeopleEditor({
  people,
  activePersonId,
  onActivePersonChange,
  onAddPerson,
  onRemovePerson,
  onChangePerson,
}) {
  return (
    <section className="panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">多人对比</h2>
          <p className="section-copy">人物名称可手动填写，会显示在右侧 KDA 上方。</p>
        </div>
        <button
          type="button"
          className="icon-button primary"
          onClick={onAddPerson}
          title="新增人物"
          disabled={people.length >= 5}
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="person-tabs">
        {people.map((person) => (
          <button
            type="button"
            className={activePersonId === person.id ? 'active' : ''}
            onClick={() => onActivePersonChange(person.id)}
            key={person.id}
          >
            <span style={{ background: person.color }} />
            {person.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {people.map((person) => (
          <div className="person-row" key={person.id}>
            <Users size={17} />
            <input
              value={person.name}
              onChange={(event) => onChangePerson(person.id, 'name', event.target.value)}
              aria-label="人物名称"
            />
            <input
              type="color"
              value={person.color}
              onChange={(event) => onChangePerson(person.id, 'color', event.target.value)}
              aria-label="人物颜色"
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => onRemovePerson(person.id)}
              title="删除人物"
              disabled={people.length <= 1}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
