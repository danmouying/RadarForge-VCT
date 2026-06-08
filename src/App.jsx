import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimationControls } from './components/AnimationControls'
import { BattlePowerControls } from './components/BattlePowerControls'
import { CanvasControls } from './components/CanvasControls'
import { DimensionEditor } from './components/DimensionEditor'
import { JsonControls } from './components/JsonControls'
import { PeopleEditor } from './components/PeopleEditor'
import { PortraitControls } from './components/PortraitControls'
import { RadarPreview } from './components/RadarPreview'
import { TemplateLibrary } from './components/TemplateLibrary'
import { ThemePicker } from './components/ThemePicker'
import { TitleControls } from './components/TitleControls'
import { canvasRatios, defaultCanvasRatioId } from './config/canvasRatios'
import { peoplePalette } from './config/peoplePalette'
import { templates } from './config/templates'
import { defaultThemeId, themes } from './config/themes'
import { composePreviewPng } from './utils/exportPreview'
import { recordPreviewWebm } from './utils/exportVideo'
import { normalizeMatchInfo } from './utils/matchInfo'
import { createProjectSnapshot, downloadJson, readJsonFile } from './utils/projectIO'
import {
  HERO_ICON_LAYOUT_GRID,
  HUPU_RATING_TEMPLATE_CLASSIC,
  normalizeHeroIconLayout,
  normalizeHeroIcons,
  normalizeHupuRating,
  normalizeHupuRatingTemplate,
  serializeHeroIcons,
  updateHeroIconSlot,
} from './utils/portraitMeta'

const initialDimensions = [
  { id: createId(), name: '内容选题', min: 0, max: 100 },
  { id: createId(), name: '视觉冲击', min: 0, max: 100 },
  { id: createId(), name: '叙事节奏', min: 0, max: 100 },
  { id: createId(), name: '传播潜力', min: 0, max: 100 },
  { id: createId(), name: '信息密度', min: 0, max: 100 },
  { id: createId(), name: '商业转化', min: 0, max: 100 },
]

const initialPeople = [
  {
    id: createId(),
    name: '对象 A',
    color: peoplePalette[0],
    scores: [86, 78, 82, 91, 74, 69],
    portraitImage: '',
    hupuRating: '',
    kda: '',
    heroIcons: [],
    heroIconLayout: HERO_ICON_LAYOUT_GRID,
    hupuRatingTemplate: HUPU_RATING_TEMPLATE_CLASSIC,
    hupuRatingImage: '',
  },
]

const PORTRAIT_ENTRY_DURATION_MS = 1100

function App() {
  const chartRef = useRef(null)
  const exportRef = useRef(null)
  const animationFrameRef = useRef(null)
  const [title, setTitle] = useState('账号内容能力雷达图')
  const [themeId, setThemeId] = useState(defaultThemeId)
  const [canvasRatioId, setCanvasRatioId] = useState(defaultCanvasRatioId)
  const [animationDuration, setAnimationDuration] = useState(1100)
  const [dimensions, setDimensions] = useState(initialDimensions)
  const [people, setPeople] = useState(initialPeople)
  const [previewPeople, setPreviewPeople] = useState(initialPeople)
  const [activePersonId, setActivePersonId] = useState(initialPeople[0].id)
  const [portraitTitle, setPortraitTitle] = useState('人物亮点')
  const [portraitImage, setPortraitImage] = useState('')
  const [hupuRating, setHupuRating] = useState('')
  const [matchLeftTeam, setMatchLeftTeam] = useState('EDG')
  const [matchLeftScore, setMatchLeftScore] = useState('2')
  const [matchRightScore, setMatchRightScore] = useState('1')
  const [matchRightTeam, setMatchRightTeam] = useState('JDG')
  const [battleRank, setBattleRank] = useState('#1')
  const [battlePower, setBattlePower] = useState('9876')
  const [kda, setKda] = useState('')
  const [heroIcons, setHeroIcons] = useState([])
  const [heroIconLayout, setHeroIconLayout] = useState(HERO_ICON_LAYOUT_GRID)
  const [hupuRatingTemplate, setHupuRatingTemplate] = useState(HUPU_RATING_TEMPLATE_CLASSIC)
  const [hupuRatingImage, setHupuRatingImage] = useState('')
  const [portraitAnimationProgress, setPortraitAnimationProgress] = useState(1)
  const [exportStatus, setExportStatus] = useState('')
  const [videoDuration, setVideoDuration] = useState(8)
  const [isVideoExporting, setIsVideoExporting] = useState(false)

  const activeTheme = useMemo(
    () => themes.find((theme) => theme.id === themeId) ?? themes[0],
    [themeId],
  )
  const activeRatio = useMemo(
    () => canvasRatios.find((ratio) => ratio.id === canvasRatioId) ?? canvasRatios[0],
    [canvasRatioId],
  )
  const activePerson = useMemo(
    () => people.find((person) => person.id === activePersonId) ?? people[0],
    [activePersonId, people],
  )
  const hasPerPersonPortraits = people.some((person) => person.portraitImage)
  const activePortraitImage = activePerson?.portraitImage || (hasPerPersonPortraits ? '' : portraitImage)
  const activeHupuRating = activePerson?.hupuRating ?? hupuRating
  const activeKda = activePerson?.kda ?? kda
  const activeHupuRatingTemplate = normalizeHupuRatingTemplate(
    activePerson?.hupuRatingTemplate ?? hupuRatingTemplate,
  )
  const activeHupuRatingImage = activePerson?.hupuRatingImage || hupuRatingImage
  const activeHeroIcons = normalizeHeroIcons(
    activePerson?.heroIcons && activePerson.heroIcons.length > 0 ? activePerson.heroIcons : heroIcons,
  )
  const matchInfo = {
    leftTeam: matchLeftTeam,
    leftScore: matchLeftScore,
    rightScore: matchRightScore,
    rightTeam: matchRightTeam,
  }

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  function addDimension() {
    const nextDimension = { id: createId(), name: `新维度 ${dimensions.length + 1}`, min: 0, max: 100 }
    const nextDimensions = [...dimensions, nextDimension]
    const nextPeople = people.map((person) => ({
      ...person,
      scores: [...person.scores, 70],
    }))
    setDimensions(nextDimensions)
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
  }

  function removeDimension(id) {
    if (dimensions.length <= 3) return
    const index = dimensions.findIndex((dimension) => dimension.id === id)
    if (index < 0) return
    const nextDimensions = dimensions.filter((dimension) => dimension.id !== id)
    const nextPeople = people.map((person) => ({
      ...person,
      scores: person.scores.filter((_, scoreIndex) => scoreIndex !== index),
    }))
    setDimensions(nextDimensions)
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
  }

  function updateDimension(id, field, value) {
    setDimensions((current) =>
      current.map((dimension) => (dimension.id === id ? { ...dimension, [field]: value } : dimension)),
    )
  }

  function updateScore(personId, scoreIndex, value) {
    const nextPeople = people.map((person) => {
      if (person.id !== personId) return person
      return {
        ...person,
          scores: person.scores.map((score, index) =>
          index === scoreIndex ? clampScore(value) : score,
        ),
      }
    })
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
  }

  function addPerson() {
    if (people.length >= 5) return
    const nextPerson = {
      id: createId(),
      name: `对象 ${people.length + 1}`,
      color: peoplePalette[people.length % peoplePalette.length],
      scores: dimensions.map(() => 70),
      portraitImage: '',
      hupuRating: '',
      kda: '',
      heroIcons: [],
      heroIconLayout,
      hupuRatingTemplate,
      hupuRatingImage: '',
    }
    const nextPeople = [...people, nextPerson]
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
    setActivePersonId(nextPerson.id)
  }

  function removePerson(personId) {
    if (people.length <= 1) return
    const nextPeople = people.filter((person) => person.id !== personId)
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
    if (activePersonId === personId) {
      setActivePersonId(nextPeople[0].id)
    }
  }

  function updatePerson(personId, field, value) {
    const nextPeople = people.map((person) =>
      person.id === personId ? { ...person, [field]: value } : person,
    )
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
  }

  function updateHupuRating(value) {
    const normalizedRating = normalizeHupuRating(value)
    const nextPeople = people.map((person) =>
      person.id === activePersonId ? { ...person, hupuRating: normalizedRating } : person,
    )
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
    setHupuRating(normalizedRating)
  }

  function updateKda(value) {
    const nextPeople = people.map((person) =>
      person.id === activePersonId ? { ...person, kda: value } : person,
    )
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
    setKda(value)
  }

  function updateHupuRatingTemplate(value) {
    const normalizedTemplate = normalizeHupuRatingTemplate(value)
    const nextPeople = people.map((person) =>
      person.id === activePersonId ? { ...person, hupuRatingTemplate: normalizedTemplate } : person,
    )
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
    setHupuRatingTemplate(normalizedTemplate)
  }

  async function importHupuRatingImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setExportStatus('请选择图片文件。')
      event.target.value = ''
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      const nextPeople = people.map((person) =>
        person.id === activePersonId ? { ...person, hupuRatingImage: dataUrl } : person,
      )
      setPeople(nextPeople)
      setPreviewPeople(nextPeople)
      setHupuRatingImage(dataUrl)
      setExportStatus('虎扑JRs评分图片已导入。')
    } catch (error) {
      console.error(error)
      setExportStatus('虎扑JRs评分图片导入失败，请换一张图片再试。')
    } finally {
      event.target.value = ''
    }
  }

  function updateHeroIcons(value) {
    const normalizedIcons = normalizeHeroIcons(value)
    const nextPeople = people.map((person) =>
      person.id === activePersonId ? { ...person, heroIcons: normalizedIcons } : person,
    )
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
    setHeroIcons(normalizedIcons)
  }

  async function importHeroIcon(slotIndex, event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setExportStatus('请选择图片文件。')
      event.target.value = ''
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      const nextIcons = updateHeroIconSlot(activeHeroIcons, slotIndex, dataUrl)
      const nextPeople = people.map((person) =>
        person.id === activePersonId ? { ...person, heroIcons: nextIcons } : person,
      )
      setPeople(nextPeople)
      setPreviewPeople(nextPeople)
      setHeroIcons(nextIcons)
      setExportStatus(`英雄头像 ${slotIndex + 1} 已导入。`)
    } catch (error) {
      console.error(error)
      setExportStatus('英雄头像导入失败，请换一张图片再试。')
    } finally {
      event.target.value = ''
    }
  }

  function playAnimation() {
    void runRadarAnimation(animationDuration)
  }

  async function runRadarAnimation(durationMs, { reset = true } = {}) {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const targetPeople = people

    if (reset) {
      setPreviewPeople(targetPeople.map((person) => ({ ...person, scores: person.scores.map(() => 0) })))
      setPortraitAnimationProgress(0)
      await waitForAnimationFrame()
    }

    const startedAt = performance.now()
    const portraitDuration = Math.min(
      1500,
      Math.max(500, Math.min(PORTRAIT_ENTRY_DURATION_MS, durationMs)),
    )

    return new Promise((resolve) => {
      const tick = (now) => {
        const progress = Math.min((now - startedAt) / durationMs, 1)
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        const portraitProgress = Math.min((now - startedAt) / portraitDuration, 1)
        const easedPortraitProgress = 1 - Math.pow(1 - portraitProgress, 3)
        setPreviewPeople(
          targetPeople.map((person) => ({
            ...person,
            scores: person.scores.map((score) => Math.round(score * easedProgress)),
          })),
        )
        setPortraitAnimationProgress(easedPortraitProgress)

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(tick)
        } else {
          animationFrameRef.current = null
          resolve()
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick)
    })
  }

  async function exportPng() {
    if (!exportRef.current) return

    setExportStatus('正在生成 PNG...')

    try {
      await document.fonts.ready
      const dataUrl = await composePreviewPng(exportRef.current, activeTheme)
      const savedPath = await savePngLocally({
        dataUrl,
        fileName: sanitizeFileName(title || 'RadarForge'),
      })
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${sanitizeFileName(title || 'RadarForge')}.png`
      link.click()
      setExportStatus(savedPath ? `已保存：${savedPath}` : '已导出，请在浏览器默认下载目录查看。')
    } catch (error) {
      console.error(error)
      setExportStatus('导出失败，请稍后再试。')
    }
  }

  async function exportVideo() {
    if (!exportRef.current || isVideoExporting) return

    setIsVideoExporting(true)
    setExportStatus(`正在录制 ${videoDuration} 秒 WebM...`)

    try {
      await document.fonts.ready
      setPreviewPeople(people.map((person) => ({ ...person, scores: person.scores.map(() => 0) })))
      setPortraitAnimationProgress(0)
      await waitForAnimationFrame()
      const { blob, extension } = await recordPreviewWebm({
        previewNode: exportRef.current,
        theme: activeTheme,
        durationMs: videoDuration * 1000,
        animationMs: animationDuration,
        exportSize: activeRatio.exportSize,
        animate: (durationMs) => runRadarAnimation(durationMs, { reset: false }),
      })
      const fileName = sanitizeFileName(title || 'RadarForge')
      const dataUrl = await blobToDataUrl(blob)
      const savedPath = await saveVideoLocally({ dataUrl, fileName, extension })
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${fileName}.${extension}`
      link.click()
      setExportStatus(savedPath ? `视频已保存：${savedPath}` : '视频已导出，请在浏览器默认下载目录查看。')
    } catch (error) {
      console.error(error)
      setExportStatus('视频导出失败：当前浏览器可能不支持 WebM 录制。')
    } finally {
      setIsVideoExporting(false)
    }
  }

  async function saveJson() {
    const snapshot = createProjectSnapshot({
      title,
      themeId,
      canvasRatioId,
      animationDuration,
      dimensions,
      people,
      portraitTitle,
      portraitImage: activePortraitImage || portraitImage,
      hupuRating: activeHupuRating,
      matchInfo,
      battleRank,
      battlePower,
      kda: activeKda,
      heroIcons: activeHeroIcons,
      heroIconLayout,
      hupuRatingTemplate: activeHupuRatingTemplate,
      hupuRatingImage: activeHupuRatingImage,
    })
    const fileName = sanitizeFileName(title || 'RadarForge')
    downloadJson(snapshot, fileName)
    const savedPath = await saveJsonLocally({ payload: snapshot, fileName })
    setExportStatus(savedPath ? `JSON 已保存：${savedPath}` : 'JSON 已下载。')
  }

  async function importJson(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const project = await readJsonFile(file)
      applyProject(project)
      setExportStatus('JSON 已导入。')
    } catch (error) {
      console.error(error)
      setExportStatus('JSON 导入失败，请检查文件格式。')
    } finally {
      event.target.value = ''
    }
  }

  function applyTemplate(template) {
    applyProject({
      title: template.title,
      themeId,
      canvasRatioId,
      animationDuration,
      dimensions: template.dimensions.map((name) => ({ name, min: 0, max: 100 })),
      people: template.people,
      heroIconLayout: template.heroIconLayout,
    })
    setExportStatus(`已应用模板：${template.name}`)
  }

  function applyProject(project) {
    const normalized = normalizeProject(project)
    setTitle(normalized.title)
    setThemeId(normalized.themeId)
    setCanvasRatioId(normalized.canvasRatioId)
    setAnimationDuration(normalized.animationDuration)
    setDimensions(normalized.dimensions)
    setPeople(normalized.people)
    setPreviewPeople(normalized.people)
    setActivePersonId(normalized.people[0].id)
    setPortraitTitle(normalized.portraitTitle)
    setPortraitImage(normalized.portraitImage)
    setHupuRating(normalized.hupuRating)
    setMatchLeftTeam(normalized.matchInfo.leftTeam)
    setMatchLeftScore(normalized.matchInfo.leftScore)
    setMatchRightScore(normalized.matchInfo.rightScore)
    setMatchRightTeam(normalized.matchInfo.rightTeam)
    setBattleRank(normalized.battleRank)
    setBattlePower(normalized.battlePower)
    setKda(normalized.kda)
    setHeroIcons(normalized.heroIcons)
    setHeroIconLayout(normalized.heroIconLayout)
    setHupuRatingTemplate(normalized.hupuRatingTemplate)
    setHupuRatingImage(normalized.hupuRatingImage)
    setPortraitAnimationProgress(1)
  }

  async function importPortrait(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setExportStatus('请选择图片文件。')
      event.target.value = ''
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      const nextPeople = people.map((person) =>
        person.id === activePersonId ? { ...person, portraitImage: dataUrl } : person,
      )
      setPeople(nextPeople)
      setPreviewPeople(nextPeople)
      setPortraitImage(dataUrl)
      setPortraitAnimationProgress(1)
      setExportStatus('人物图片已导入。')
    } catch (error) {
      console.error(error)
      setExportStatus('图片导入失败，请换一张图片再试。')
    } finally {
      event.target.value = ''
    }
  }

  function clearPortrait() {
    const nextPeople = people.map((person) =>
      person.id === activePersonId ? { ...person, portraitImage: '' } : person,
    )
    setPeople(nextPeople)
    setPreviewPeople(nextPeople)
    setPortraitImage('')
    setPortraitAnimationProgress(1)
    setExportStatus('人物图片已移除。')
  }

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-950">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-5 lg:h-screen lg:flex-row lg:overflow-hidden">
        <aside className="flex min-w-0 flex-col gap-4 lg:w-[460px] lg:overflow-auto lg:pr-1">
          <header className="app-header">
            <span>RadarForge</span>
            <h1>自媒体雷达图生成器</h1>
            <p>编辑维度、分数和视觉主题，右侧实时生成可导出的内容创作素材。</p>
          </header>
          <TitleControls
            matchInfo={matchInfo}
            onMatchLeftTeamChange={setMatchLeftTeam}
            onMatchLeftScoreChange={setMatchLeftScore}
            onMatchRightScoreChange={setMatchRightScore}
            onMatchRightTeamChange={setMatchRightTeam}
          />
          <PortraitControls
            activePersonName={activePerson?.name || '当前人物'}
            hasPortraitImage={Boolean(activePortraitImage)}
            hupuRating={activeHupuRating}
            kda={activeKda}
            heroIconsText={serializeHeroIcons(activeHeroIcons)}
            heroIconLayout={heroIconLayout}
            hupuRatingTemplate={activeHupuRatingTemplate}
            onHupuRatingChange={updateHupuRating}
            onHupuRatingTemplateChange={updateHupuRatingTemplate}
            onKdaChange={updateKda}
            onHeroIconsChange={updateHeroIcons}
            onHeroIconLayoutChange={(value) => setHeroIconLayout(normalizeHeroIconLayout(value))}
            onImageImport={importPortrait}
            onImageClear={clearPortrait}
          />
          <BattlePowerControls
            battleRank={battleRank}
            battlePower={battlePower}
            onBattleRankChange={setBattleRank}
            onBattlePowerChange={setBattlePower}
          />
          <CanvasControls
            ratios={canvasRatios}
            activeRatioId={canvasRatioId}
            onRatioChange={setCanvasRatioId}
          />
          <AnimationControls
            duration={animationDuration}
            onDurationChange={setAnimationDuration}
            onReplay={playAnimation}
          />
          <PeopleEditor
            people={people}
            activePersonId={activePersonId}
            onActivePersonChange={setActivePersonId}
            onAddPerson={addPerson}
            onRemovePerson={removePerson}
            onChangePerson={updatePerson}
          />
          <DimensionEditor
            dimensions={dimensions}
            activePerson={activePerson}
            onAdd={addDimension}
            onRemove={removeDimension}
            onChangeDimension={updateDimension}
            onChangeScore={updateScore}
          />
          <ThemePicker themes={themes} activeThemeId={themeId} onThemeChange={setThemeId} />
          <TemplateLibrary templates={templates} onApplyTemplate={applyTemplate} />
          <JsonControls onSaveJson={saveJson} onImportJson={importJson} />
        </aside>

        <div className="min-w-0 flex-1">
          <RadarPreview
            ref={chartRef}
            exportRef={exportRef}
            title={title}
            dimensions={dimensions}
            people={previewPeople}
            activePersonId={activePersonId}
            theme={activeTheme}
            onPlay={playAnimation}
            onExport={exportPng}
            onExportVideo={exportVideo}
            exportStatus={exportStatus}
            videoDuration={videoDuration}
            onVideoDurationChange={setVideoDuration}
            isVideoExporting={isVideoExporting}
            canvasRatio={activeRatio}
            portraitTitle={portraitTitle}
            portraitImage={activePortraitImage}
            hupuRating={activeHupuRating}
            matchInfo={matchInfo}
            battleRank={battleRank}
            battlePower={battlePower}
            kda={activeKda}
            heroIcons={activeHeroIcons}
            heroIconLayout={heroIconLayout}
            hupuRatingTemplate={activeHupuRatingTemplate}
            hupuRatingImage={activeHupuRatingImage}
            onHupuRatingChange={updateHupuRating}
            onHupuRatingImageImport={importHupuRatingImage}
            onHeroIconImport={importHeroIcon}
            portraitName={activePerson?.name || ''}
            portraitAnimationProgress={portraitAnimationProgress}
            onPortraitImport={importPortrait}
            onPortraitClear={clearPortrait}
          />
        </div>
      </div>
    </main>
  )
}

function normalizeProject(project) {
  const matchInfo = normalizeMatchInfo(project)
  const rawDimensions = Array.isArray(project.dimensions) ? project.dimensions : []
  const dimensions = rawDimensions.slice(0, 12).map((dimension, index) => ({
    id: createId(),
    name: typeof dimension === 'string' ? dimension : dimension?.name || `维度 ${index + 1}`,
    min: normalizeDimensionNumber(typeof dimension === 'string' ? undefined : dimension?.min, 0),
    max: normalizeDimensionMax(typeof dimension === 'string' ? undefined : dimension?.max, 100),
  }))
  const safeDimensions =
    dimensions.length >= 3 ? dimensions : initialDimensions.map((dimension) => ({ ...dimension, id: createId() }))

  const rawPeople = Array.isArray(project.people) ? project.people.slice(0, 5) : []
  const people =
    rawPeople.length > 0
      ? rawPeople.map((person, index) => ({
          id: createId(),
          name: person?.name || `对象 ${index + 1}`,
          color: person?.color || peoplePalette[index % peoplePalette.length],
          scores: safeDimensions.map((dimension, scoreIndex) =>
            clampScore(person?.scores?.[scoreIndex] ?? rawDimensions[scoreIndex]?.score ?? 70, dimension.min),
          ),
          portraitImage: typeof person?.portraitImage === 'string' ? person.portraitImage : '',
          hupuRating: normalizeHupuRating(person?.hupuRating ?? project.hupuRating ?? ''),
          kda: typeof person?.kda === 'string' ? person.kda : project.kda || '',
          heroIcons: normalizeHeroIcons(person?.heroIcons ?? project.heroIcons),
          heroIconLayout: normalizeHeroIconLayout(person?.heroIconLayout ?? project.heroIconLayout),
          hupuRatingTemplate: normalizeHupuRatingTemplate(
            person?.hupuRatingTemplate ?? project.hupuRatingTemplate,
          ),
          hupuRatingImage:
            typeof person?.hupuRatingImage === 'string'
              ? person.hupuRatingImage
              : typeof project.hupuRatingImage === 'string'
                ? project.hupuRatingImage
                : '',
        }))
      : initialPeople.map((person) => ({
          ...person,
          id: createId(),
          scores: safeDimensions.map((dimension, scoreIndex) => clampScore(person.scores[scoreIndex] ?? 70, dimension.min)),
          portraitImage: typeof project.portraitImage === 'string' ? project.portraitImage : '',
          hupuRating: normalizeHupuRating(project.hupuRating ?? ''),
          kda: typeof project.kda === 'string' ? project.kda : '',
          heroIcons: normalizeHeroIcons(project.heroIcons),
          heroIconLayout: normalizeHeroIconLayout(project.heroIconLayout),
          hupuRatingTemplate: normalizeHupuRatingTemplate(project.hupuRatingTemplate),
          hupuRatingImage: typeof project.hupuRatingImage === 'string' ? project.hupuRatingImage : '',
        }))

  return {
    title: project.title || 'RadarForge 雷达图',
    themeId: themes.some((theme) => theme.id === project.themeId) ? project.themeId : defaultThemeId,
    canvasRatioId: canvasRatios.some((ratio) => ratio.id === project.canvasRatioId)
      ? project.canvasRatioId
      : defaultCanvasRatioId,
    animationDuration: clampNumber(project.animationDuration, 500, 3000, 1100),
    dimensions: safeDimensions,
    people,
    portraitTitle: project.portraitTitle || '人物亮点',
    portraitImage: typeof project.portraitImage === 'string' ? project.portraitImage : '',
    hupuRating: normalizeHupuRating(project.hupuRating ?? ''),
    matchInfo,
    battleRank: normalizeBattleRank(project.battleRank),
    battlePower: typeof project.battlePower === 'string' ? project.battlePower : String(project.battlePower ?? '9876'),
    kda: typeof project.kda === 'string' ? project.kda : '',
    heroIcons: normalizeHeroIcons(project.heroIcons),
    heroIconLayout: normalizeHeroIconLayout(project.heroIconLayout ?? people[0]?.heroIconLayout),
    hupuRatingTemplate: normalizeHupuRatingTemplate(
      project.hupuRatingTemplate ?? people[0]?.hupuRatingTemplate,
    ),
    hupuRatingImage: typeof project.hupuRatingImage === 'string' ? project.hupuRatingImage : '',
  }
}

function createId() {
  return crypto.randomUUID()
}

function clampScore(value, min = 0) {
  return clampNumber(value, min, 999, min)
}

function normalizeDimensionNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeDimensionMax(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

function normalizeBattleRank(value) {
  const rank = typeof value === 'string' ? value.trim() : ''
  return /^#(?:10|[1-9])$/.test(rank) ? rank : '#1'
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value)
  if (Number.isNaN(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function sanitizeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, '-').trim() || 'RadarForge'
}

async function savePngLocally({ dataUrl, fileName }) {
  try {
    const response = await fetch('/api/export-png', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, fileName }),
    })
    if (!response.ok) return ''
    const result = await response.json()
    return result.path || ''
  } catch {
    return ''
  }
}

async function saveJsonLocally({ payload, fileName }) {
  try {
    const response = await fetch('/api/export-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, fileName }),
    })
    if (!response.ok) return ''
    const result = await response.json()
    return result.path || ''
  } catch {
    return ''
  }
}

async function saveVideoLocally({ dataUrl, fileName, extension }) {
  try {
    const response = await fetch('/api/export-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, fileName, extension }),
    })
    if (!response.ok) return ''
    const result = await response.json()
    return result.path || ''
  } catch {
    return ''
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function waitForAnimationFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default App
