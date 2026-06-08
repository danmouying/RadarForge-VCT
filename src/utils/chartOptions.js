export function buildRadarOption({ title, dimensions, people, activePersonId, theme }) {
  const scoreColor = theme.scoreText ?? theme.chartLine
  const activePerson = people.find((person) => person.id === activePersonId) ?? people[0]
  const radarAreaOpacity = 0.8
  const indicators = dimensions.map((dimension, index) => {
    const min = normalizeNumber(dimension.min, 0)
    const max = normalizeMax(dimension.max, min)
    const score = normalizeNumber(activePerson?.scores[index], min)
    const scoreStyle = score > max ? 'overScore' : 'score'

    return {
      name: `{label|${dimension.name || '未命名'}}\n{${scoreStyle}|${formatScore(score)}}`,
      min,
      max,
    }
  })
  const isCompareMode = people.length > 1

  return {
    backgroundColor: theme.canvas,
    animation: false,
    tooltip: {
      trigger: 'item',
      backgroundColor: theme.panel,
      borderColor: theme.border,
      textStyle: { color: theme.text },
    },
    radar: {
      center: ['32%', '55%'],
      radius: '52%',
      startAngle: 90,
      splitNumber: 5,
      indicator: indicators,
      axisName: {
        color: theme.text,
        fontSize: 13,
        lineHeight: 22,
        padding: [6, 10],
        rich: {
          label: {
            color: theme.text,
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 20,
          },
          score: {
            align: 'center',
            color: scoreColor,
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 17,
            padding: [0, 0, 0, 0],
          },
          overScore: {
            align: 'center',
            color: theme.accent2 || scoreColor,
            fontSize: 14,
            fontWeight: 900,
            lineHeight: 19,
            textShadowBlur: 10,
            textShadowColor: theme.accent2 || scoreColor,
          },
        },
      },
      axisLine: {
        lineStyle: {
          color: theme.splitLine,
        },
      },
      splitLine: {
        lineStyle: {
          color: theme.splitLine,
        },
      },
      splitArea: {
        areaStyle: {
          color: theme.splitArea,
        },
      },
    },
    series: [
      {
        id: 'primary-radar',
        name: title,
        type: 'radar',
        symbol: 'none',
        lineStyle: {
          width: isCompareMode ? 2 : 2.5,
          color: theme.chartLine,
          shadowBlur: 18,
          shadowColor: theme.accent,
        },
        itemStyle: {
          color: theme.accent2,
          borderColor: theme.chartLine,
          borderWidth: 2,
        },
        areaStyle: {
          color: theme.chartArea,
          opacity: radarAreaOpacity,
        },
        emphasis: {
          lineStyle: {
            width: 4,
          },
        },
        data: [
          ...people.map((person, index) => {
            const color = person.color || theme.chartLine
            const hasOverCap = person.scores.some((score, scoreIndex) => {
              const dimension = dimensions[scoreIndex] ?? {}
              return normalizeNumber(score, 0) > normalizeMax(dimension.max, normalizeNumber(dimension.min, 0))
            })
            return {
              value: person.scores,
              name: person.name || `人物 ${index + 1}`,
              lineStyle: {
                color: hasOverCap ? theme.accent2 || color : color,
                width: hasOverCap ? 3.5 : person.id === activePersonId ? 2.5 : 1.8,
                shadowBlur: hasOverCap ? 28 : person.id === activePersonId ? 14 : 0,
                shadowColor: hasOverCap ? theme.accent2 || color : color,
              },
              itemStyle: {
                color: hasOverCap ? theme.accent2 || color : color,
                borderColor: theme.canvas,
                borderWidth: hasOverCap ? 2 : 1,
                shadowBlur: hasOverCap ? 18 : 0,
                shadowColor: theme.accent2 || color,
              },
              areaStyle: {
                color,
                opacity: radarAreaOpacity,
              },
            }
          }),
        ],
      },
    ],
    legend: isCompareMode
      ? {
          left: '34%',
          bottom: 12,
          orient: 'horizontal',
          textStyle: {
            color: theme.muted,
            fontSize: 12,
          },
          itemWidth: 12,
          itemHeight: 8,
        }
      : undefined,
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

function formatScore(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
