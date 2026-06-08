export function buildRadarGeometry({
  dimensions,
  values,
  center,
  radius,
  labelOffset = 82,
  progress,
}) {
  const chartCenter = center
  const dimensionData = dimensions.length >= 3
    ? dimensions.map((dimension, index) => normalizeDimension(dimension, index))
    : ['维度一', '维度二', '维度三'].map((name) => ({ name, min: 0, max: 100 }))
  const labels = dimensionData.map((dimension) => dimension.name)
  const safeValues = dimensionData.map((dimension, index) => Math.max(dimension.min, normalizeNumber(values[index] ?? dimension.score ?? dimension.min, dimension.min)))
  const ratios = safeValues.map((value, index) => {
    const dimension = dimensionData[index]
    return Math.max(0, (value - dimension.min) / (dimension.max - dimension.min))
  })
  const count = labels.length
  const rings = [1, 2, 3, 4, 5]
  const angles = labels.map((_, index) => -Math.PI / 2 - (Math.PI * 2 * index) / count)

  const grid = rings.map((level) => ({
    level,
    points: angles
      .map((angle) => pointToString(projectPoint(chartCenter, angle, radius * (level / rings.length))))
      .join(' '),
  }))

  const axes = angles.map((angle, index) => ({
    label: labels[index],
    end: projectPoint(chartCenter, angle, radius),
  }))

  const dataPoints = angles.map((angle, index) => {
    const value = safeValues[index]
    const ratio = ratios[index]
    return {
      ...projectPoint(chartCenter, angle, radius * ratio * progress),
      label: labels[index],
      value,
      overCap: value > dimensionData[index].max,
    }
  })

  const labelPoints = angles.map((angle, index) => {
    const labelPoint = projectPoint(chartCenter, angle, radius + labelOffset)
    return {
      ...labelPoint,
      label: labels[index],
      value: safeValues[index],
      overCap: safeValues[index] > dimensionData[index].max,
      anchor: getTextAnchor(Math.cos(angle)),
    }
  })

  return {
    center: chartCenter,
    grid,
    axes,
    dataPoints,
    labelPoints,
    polygon: dataPoints.map(pointToString).join(' '),
  }
}

function normalizeDimension(dimension, index) {
  if (typeof dimension === 'string') {
    return { name: dimension, score: undefined, min: 0, max: 100 }
  }

  const min = normalizeNumber(dimension?.min, 0)
  const max = normalizeMax(dimension?.max, min)

  return {
    name: String(dimension?.name || dimension?.label || `维度 ${index + 1}`),
    score: normalizeNumber(dimension?.score, undefined),
    min,
    max,
  }
}

function normalizeNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeMax(value, min) {
  const number = Number(value)
  return Number.isFinite(number) && number > min ? number : min + 100
}

function projectPoint(center, angle, distance) {
  return {
    x: center.x + Math.cos(angle) * distance,
    y: center.y + Math.sin(angle) * distance,
  }
}

function pointToString(point) {
  return `${round(point.x)},${round(point.y)}`
}

function getTextAnchor(cosine) {
  if (cosine > 0.35) return 'start'
  if (cosine < -0.35) return 'end'
  return 'middle'
}

function round(value) {
  return Math.round(value * 100) / 100
}
