import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  STARS, CONSTELLATIONS, validateCatalog,
  constellationMembersBrightnessOrdered,
  starDisplayName, constellationDisplayName,
} from '../data/stars'
import type { Star, Constellation, SearchResult, CatalogIssue } from '../types'

// 每颗星逐步出现的时间间隔（毫秒），按亮度顺序依次显现
export const REVEAL_STEP_MS = 800

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

  // 星表自检结果（名字缺失 / 索引错误等，界面上提示，不静默留空）
  const catalogIssues = ref<CatalogIssue[]>(validateCatalog())

  // 当前聚焦的星座（搜索或点击侧栏星座后设置）
  const focusedConstellation = ref<Constellation | null>(null)
  const focusStartedAt = ref(0)
  // 供画布与面板共用的时钟（ms）
  const nowMs = ref(Date.now())
  setInterval(() => { nowMs.value = Date.now() }, 100)

  const localSiderealTime = computed(() => {
    const d = viewDate.value
    const jd = d.getTime() / 86400000 + 2440587.5
    const T = (jd - 2451545.0) / 36525.0
    let lst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * (0.000387933 - T / 38710000)
    lst = ((lst % 360) + 360) % 360
    return lst / 15 // convert to hours
  })

  // 聚焦星座的成员：统一按亮度等级（视星等升序，越亮越先出现）
  const focusMembers = computed<Star[]>(() =>
    focusedConstellation.value
      ? constellationMembersBrightnessOrdered(focusedConstellation.value)
      : []
  )

  // 已逐步显现的成员数量
  const revealedCount = computed(() => {
    if (!focusedConstellation.value) return 0
    const elapsed = nowMs.value - focusStartedAt.value
    return Math.max(0, Math.min(
      focusMembers.value.length,
      Math.floor(elapsed / REVEAL_STEP_MS) + 1
    ))
  })

  const revealProgress = computed(() =>
    focusMembers.value.length ? revealedCount.value / focusMembers.value.length : 0
  )

  /** 某颗星在当前聚焦星座中的亮度序号（0 最亮）；未聚焦或非成员返回 null */
  function revealRank(star: Star): number | null {
    if (!focusedConstellation.value) return null
    const idx = focusMembers.value.indexOf(star)
    return idx === -1 ? null : idx
  }

  function isStarRevealed(star: Star): boolean {
    const rank = revealRank(star)
    return rank === null || rank < revealedCount.value
  }

  // 搜索：拉丁写法与中文写法都能命中，星与星座都能查到
  const searchResults = computed<SearchResult[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return []

    const results: SearchResult[] = []

    for (const s of STARS) {
      if (s.name.toLowerCase().includes(q) || s.nameCn.includes(searchQuery.value.trim())) {
        results.push({
          type: 'star',
          label: starDisplayName(s),
          sub: `视星等 ${s.mag}`,
          star: s,
        })
      }
    }

    for (const c of CONSTELLATIONS) {
      const hit = c.name.toLowerCase().includes(q) ||
        c.nameCn.includes(searchQuery.value.trim()) ||
        (c.abbr && c.abbr.toLowerCase().includes(q))
      if (hit) {
        results.push({
          type: 'constellation',
          label: constellationDisplayName(c),
          sub: `星座 · ${c.stars.length} 颗成员星`,
          constellation: c,
        })
      }
    }

    return results.slice(0, 10)
  })

  function focusConstellation(c: Constellation) {
    focusedConstellation.value = c
    nowMs.value = Date.now()
    focusStartedAt.value = nowMs.value
    selectedStar.value = null
  }

  function clearFocus() {
    focusedConstellation.value = null
  }

  function showAllMembers() {
    // 立即显示全部成员（把起始时间提前到所有步骤之前）
    nowMs.value = Date.now()
    focusStartedAt.value = nowMs.value - REVEAL_STEP_MS * focusMembers.value.length
  }

  function replayReveal() {
    nowMs.value = Date.now()
    focusStartedAt.value = nowMs.value
  }

  function pickSearchResult(r: SearchResult) {
    if (r.constellation) {
      focusConstellation(r.constellation)
    } else if (r.star) {
      selectedStar.value = r.star
    }
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
    selectedStar, searchQuery, latitude,
    catalogIssues, localSiderealTime,
    focusedConstellation, focusMembers, revealedCount, revealProgress, nowMs,
    searchResults,
    projectStar, starRadius, spectralColor, selectStar,
    focusConstellation, clearFocus, showAllMembers, replayReveal,
    isStarRevealed, revealRank, pickSearchResult,
    STARS, CONSTELLATIONS
  }
})
