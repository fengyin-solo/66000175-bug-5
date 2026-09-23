import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { STARS, CONSTELLATIONS } from '../data/stars'
import type { Star, Constellation } from '../types'

export const useSkyStore = defineStore('sky', () => {
  const viewDate = ref(new Date())
  const zoom = ref(1.0)
  const panX = ref(0)
  const panY = ref(0)
  const showLabels = ref(true)
  const showConstLines = ref(true)
  const showGrid = ref(true)
  const selectedStar = ref<Star | null>(null)
  const searchQuery = ref('')
  const latitude = ref(39.9) // Beijing default

  const localSiderealTime = computed(() => {
    const d = viewDate.value
    const jd = d.getTime() / 86400000 + 2440587.5
    const T = (jd - 2451545.0) / 36525.0
    let lst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * (0.000387933 - T / 38710000)
    lst = ((lst % 360) + 360) % 360
    return lst / 15 // convert to hours
  })

  // ---- 搜索：星座与恒星共用同一份名字（中文 + 拉丁）与排序依据（亮度） ----

  const activeQuery = computed(() => searchQuery.value.trim())
  const activeQueryLower = computed(() => activeQuery.value.toLowerCase())

  function constellationMatches(c: Constellation): boolean {
    if (!activeQuery.value) return false
    return c.name.toLowerCase().includes(activeQueryLower.value) ||
      c.nameCn.includes(activeQuery.value)
  }

  const matchedConstellation = computed<Constellation | null>(() =>
    CONSTELLATIONS.find(constellationMatches) ?? null)

  // 成员星按亮度（视星等，数值越小越亮）排序
  const constellationMembers = computed<Star[]>(() => {
    const c = matchedConstellation.value
    if (!c) return []
    return c.stars.map(i => STARS[i]).sort((a, b) => a.mag - b.mag)
  })

  const matchedStars = computed<Star[]>(() => {
    const q = activeQueryLower.value
    if (!q) return []
    return STARS.filter(s => s.name.toLowerCase().includes(q))
      .sort((a, b) => a.mag - b.mag)
      .slice(0, 8)
  })

  // idle: 未输入 / results: 有命中 / empty: 有输入但无命中（界面需提示，不能静默留空）
  const searchState = computed<'idle' | 'results' | 'empty'>(() => {
    if (!activeQuery.value) return 'idle'
    return (matchedConstellation.value || matchedStars.value.length > 0) ? 'results' : 'empty'
  })

  // 命中星座后逐步显示成员星
  const revealCount = ref(0)
  let revealTimer: ReturnType<typeof setInterval> | undefined
  watch(matchedConstellation, (c) => {
    if (revealTimer) { clearInterval(revealTimer); revealTimer = undefined }
    revealCount.value = 0
    if (!c) return
    revealTimer = setInterval(() => {
      revealCount.value += 1
      if (revealCount.value >= c.stars.length && revealTimer) {
        clearInterval(revealTimer)
        revealTimer = undefined
      }
    }, 160)
  }, { immediate: true })

  const visibleMembers = computed<Star[]>(() =>
    constellationMembers.value.slice(0, revealCount.value))

  // 侧栏星表、搜索结果、画布标签共用同一份星座名写法
  function constellationLabel(c: Constellation): string {
    return c.nameCn ? `${c.nameCn} · ${c.name}` : c.name
  }

  // 点击星表中的星座 = 用它的名字发起搜索，走同一条命中/排序/显示路径
  function selectConstellation(c: Constellation) {
    searchQuery.value = c.nameCn || c.name
  }

  function projectStar(ra: number, dec: number, cx: number, cy: number, scale: number): [number, number] {
    const ha = (localSiderealTime.value - ra) * 15 * Math.PI / 180
    const decRad = dec * Math.PI / 180
    const latRad = latitude.value * Math.PI / 180

    const alt = Math.asin(Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha))
    const az = Math.atan2(-Math.cos(decRad) * Math.sin(ha), Math.sin(decRad) * Math.cos(latRad) - Math.cos(decRad) * Math.sin(latRad) * Math.cos(ha))

    if (alt < -0.1) return [-999, -999] // below horizon

    const r = (Math.PI / 2 - alt) * scale * 0.45
    const x = cx + panX.value + r * Math.sin(az)
    const y = cy + panY.value - r * Math.cos(az)
    return [x, y]
  }

  function starRadius(mag: number): number {
    return Math.max(1, 5 - mag) * zoom.value
  }

  function spectralColor(spectral: string): string {
    const colors: Record<string, string> = {
      'O': '#9bb0ff', 'B': '#aabfff', 'A': '#cad7ff',
      'F': '#f8f7ff', 'G': '#fff4ea', 'K': '#ffd2a1', 'M': '#ffcc6f'
    }
    return colors[spectral] || '#ffffff'
  }

  function selectStar(x: number, y: number, cx: number, cy: number, scale: number) {
    let closest: Star | null = null
    let minDist = 20
    for (const star of STARS) {
      const [sx, sy] = projectStar(star.ra, star.dec, cx, cy, scale)
      const dist = Math.hypot(sx - x, sy - y)
      if (dist < minDist) { minDist = dist; closest = star }
    }
    selectedStar.value = closest
  }

  return {
    viewDate, zoom, panX, panY, showLabels, showConstLines, showGrid,
    selectedStar, searchQuery, latitude, localSiderealTime,
    activeQuery, matchedConstellation, constellationMembers, matchedStars,
    searchState, visibleMembers, constellationLabel, selectConstellation,
    projectStar, starRadius, spectralColor, selectStar,
    STARS, CONSTELLATIONS
  }
})
