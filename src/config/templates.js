export const templates = [
  {
    id: 'esports-player',
    name: '电竞选手',
    title: '电竞选手能力雷达图',
    dimensions: ['操作上限', '反应速度', '团队协作', '战术理解', '稳定性', '逆风处理'],
    people: [
      { name: '选手 A', scores: [92, 88, 81, 86, 79, 84] },
      { name: '选手 B', scores: [84, 91, 78, 80, 86, 76] },
    ],
  },
  {
    id: 'anime-fighter',
    name: '动漫战斗角色',
    title: '战斗角色强度雷达图',
    dimensions: ['力量', '速度', '防御', '技巧', '意志', '爆发'],
    people: [
      { name: '角色 A', scores: [90, 83, 76, 88, 95, 91] },
      { name: '角色 B', scores: [82, 92, 70, 84, 86, 89] },
    ],
  },
  {
    id: 'basketball-player',
    name: '篮球球员',
    title: '篮球球员能力雷达图',
    dimensions: ['得分', '组织', '防守', '篮板', '效率', '关键球'],
    people: [
      { name: '球员 A', scores: [89, 82, 78, 75, 86, 91] },
      { name: '球员 B', scores: [78, 90, 84, 72, 82, 80] },
    ],
  },
  {
    id: 'football-player',
    name: '足球球员',
    title: '足球球员能力雷达图',
    dimensions: ['射门', '传球', '盘带', '防守', '速度', '比赛阅读'],
    people: [
      { name: '球员 A', scores: [87, 83, 89, 66, 91, 80] },
      { name: '球员 B', scores: [76, 90, 82, 73, 84, 88] },
    ],
  },
  {
    id: 'historical-figure',
    name: '历史人物',
    title: '历史人物影响力雷达图',
    dimensions: ['战略', '领导', '创新', '影响力', '执行', '争议度'],
    people: [
      { name: '人物 A', scores: [91, 88, 78, 94, 85, 72] },
      { name: '人物 B', scores: [82, 84, 90, 86, 79, 68] },
    ],
  },
  {
    id: 'custom',
    name: '自定义模板',
    title: '自定义能力雷达图',
    dimensions: ['维度一', '维度二', '维度三', '维度四', '维度五', '维度六'],
    people: [{ name: '对象 A', scores: [80, 76, 88, 72, 84, 90] }],
  },
]
