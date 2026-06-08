export function getSeriesMapGridLayout(mapCount) {
  const count = Math.max(1, Math.min(5, Number(mapCount) || 1))
  if (count === 1) {
    return { columns: 'minmax(0, 620px)', rows: '520px', gap: 22, positions: [{}] }
  }
  if (count === 2) {
    return { columns: 'repeat(2, minmax(0, 430px))', rows: '500px', gap: 22, positions: [{}, {}] }
  }
  if (count === 3) {
    return { columns: 'repeat(3, minmax(0, 300px))', rows: '430px', gap: 18, positions: [{}, {}, {}] }
  }
  if (count === 4) {
    return {
      columns: 'repeat(2, minmax(0, 430px))',
      rows: 'repeat(2, 310px)',
      gap: 18,
      positions: [{}, {}, {}, {}],
    }
  }
  return {
    columns: 'repeat(6, minmax(0, 1fr))',
    rows: 'repeat(2, 310px)',
    gap: 18,
    positions: [
      { gridColumn: 'span 2' },
      { gridColumn: 'span 2' },
      { gridColumn: 'span 2' },
      { gridColumn: '2 / span 2' },
      { gridColumn: '4 / span 2' },
    ],
  }
}
