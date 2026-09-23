import type { Star, Constellation, CatalogIssue } from '../types'

// 星表是侧栏、搜索、画布共用的唯一数据源：
// 每颗星同时带拉丁名(name)与中文写法(nameCn)，并标注所属星座。
export const STARS: Star[] = [
  // Orion 猎户座
  { name: 'Betelgeuse', nameCn: '参宿四', ra: 5.92, dec: 7.41, mag: 0.42, spectral: 'M', constellation: 'Orion' },
  { name: 'Rigel', nameCn: '参宿七', ra: 5.24, dec: -8.20, mag: 0.13, spectral: 'B', constellation: 'Orion' },
  { name: 'Bellatrix', nameCn: '参宿五', ra: 5.42, dec: 6.35, mag: 1.64, spectral: 'B', constellation: 'Orion' },
  { name: 'Mintaka', nameCn: '参宿三', ra: 5.53, dec: -0.30, mag: 2.23, spectral: 'O', constellation: 'Orion' },
  { name: 'Alnilam', nameCn: '参宿二', ra: 5.60, dec: -1.20, mag: 1.69, spectral: 'B', constellation: 'Orion' },
  { name: 'Alnitak', nameCn: '参宿一', ra: 5.68, dec: -1.94, mag: 1.77, spectral: 'O', constellation: 'Orion' },
  { name: 'Saiph', nameCn: '参宿六', ra: 5.80, dec: -9.67, mag: 2.09, spectral: 'B', constellation: 'Orion' },
  // Ursa Major 大熊座
  { name: 'Dubhe', nameCn: '天枢', ra: 11.06, dec: 61.75, mag: 1.79, spectral: 'K', constellation: 'Ursa Major' },
  { name: 'Merak', nameCn: '天璇', ra: 11.03, dec: 56.38, mag: 2.37, spectral: 'A', constellation: 'Ursa Major' },
  { name: 'Phecda', nameCn: '天玑', ra: 11.90, dec: 53.69, mag: 2.44, spectral: 'A', constellation: 'Ursa Major' },
  { name: 'Megrez', nameCn: '天权', ra: 12.26, dec: 57.03, mag: 3.31, spectral: 'A', constellation: 'Ursa Major' },
  { name: 'Alioth', nameCn: '玉衡', ra: 12.90, dec: 55.96, mag: 1.77, spectral: 'A', constellation: 'Ursa Major' },
  { name: 'Mizar', nameCn: '开阳', ra: 13.40, dec: 54.93, mag: 2.27, spectral: 'A', constellation: 'Ursa Major' },
  { name: 'Alkaid', nameCn: '摇光', ra: 13.79, dec: 49.31, mag: 1.86, spectral: 'B', constellation: 'Ursa Major' },
  // Cassiopeia 仙后座
  { name: 'Schedar', nameCn: '王良一', ra: 0.68, dec: 56.54, mag: 2.24, spectral: 'K', constellation: 'Cassiopeia' },
  { name: 'Caph', nameCn: '王良四', ra: 0.15, dec: 59.15, mag: 2.27, spectral: 'F', constellation: 'Cassiopeia' },
  { name: 'Gamma Cas', nameCn: '策星', ra: 0.95, dec: 60.72, mag: 2.47, spectral: 'B', constellation: 'Cassiopeia' },
  { name: 'Ruchbah', nameCn: '阁道三', ra: 1.43, dec: 60.24, mag: 2.68, spectral: 'A', constellation: 'Cassiopeia' },
  { name: 'Segin', nameCn: '阁道二', ra: 1.91, dec: 63.67, mag: 3.37, spectral: 'B', constellation: 'Cassiopeia' },
  // Scorpius 天蝎座
  { name: 'Antares', nameCn: '心宿二', ra: 16.49, dec: -26.43, mag: 0.96, spectral: 'M', constellation: 'Scorpius' },
  { name: 'Shaula', nameCn: '尾宿八', ra: 17.56, dec: -37.10, mag: 1.63, spectral: 'B', constellation: 'Scorpius' },
  { name: 'Sargas', nameCn: '尾宿五', ra: 17.62, dec: -42.99, mag: 1.87, spectral: 'F', constellation: 'Scorpius' },
  { name: 'Dschubba', nameCn: '房宿三', ra: 16.00, dec: -22.62, mag: 2.32, spectral: 'B', constellation: 'Scorpius' },
  { name: 'Graffias', nameCn: '房宿四', ra: 16.09, dec: -19.81, mag: 2.62, spectral: 'B', constellation: 'Scorpius' },
  // Cygnus 天鹅座
  { name: 'Deneb', nameCn: '天津四', ra: 20.69, dec: 45.28, mag: 1.25, spectral: 'A', constellation: 'Cygnus' },
  { name: 'Sadr', nameCn: '天津一', ra: 20.37, dec: 40.26, mag: 2.20, spectral: 'F', constellation: 'Cygnus' },
  { name: 'Albireo', nameCn: '辇道增七', ra: 19.51, dec: 27.96, mag: 3.08, spectral: 'K', constellation: 'Cygnus' },
  { name: 'Gienah', nameCn: '天津九', ra: 20.77, dec: 33.97, mag: 2.46, spectral: 'K', constellation: 'Cygnus' },
  { name: 'Delta Cyg', nameCn: '天津二', ra: 19.75, dec: 45.13, mag: 2.87, spectral: 'B', constellation: 'Cygnus' },
  // Leo 狮子座
  { name: 'Regulus', nameCn: '轩辕十四', ra: 10.14, dec: 11.97, mag: 1.35, spectral: 'B', constellation: 'Leo' },
  { name: 'Denebola', nameCn: '五帝座一', ra: 11.82, dec: 14.57, mag: 2.13, spectral: 'A', constellation: 'Leo' },
  { name: 'Algieba', nameCn: '轩辕十二', ra: 10.33, dec: 19.84, mag: 2.28, spectral: 'K', constellation: 'Leo' },
  { name: 'Zosma', nameCn: '西上相', ra: 11.24, dec: 20.52, mag: 2.56, spectral: 'A', constellation: 'Leo' },
]

export const CONSTELLATIONS: Constellation[] = [
  {
    name: 'Orion', nameCn: '猎户座', abbr: 'Ori',
    stars: [0, 1, 2, 3, 4, 5, 6],
    lines: [[0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1], [1, 3]]
  },
  {
    name: 'Ursa Major', nameCn: '大熊座', abbr: 'UMa',
    stars: [7, 8, 9, 10, 11, 12, 13],
    lines: [[7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13]]
  },
  {
    name: 'Cassiopeia', nameCn: '仙后座', abbr: 'Cas',
    stars: [14, 15, 16, 17, 18],
    lines: [[15, 14], [14, 16], [16, 17], [17, 18]]
  },
  {
    name: 'Scorpius', nameCn: '天蝎座', abbr: 'Sco',
    stars: [19, 20, 21, 22, 23],
    lines: [[23, 22], [22, 19], [19, 20], [20, 21]]
  },
  {
    name: 'Cygnus', nameCn: '天鹅座', abbr: 'Cyg',
    stars: [24, 25, 26, 27, 28],
    lines: [[26, 25], [25, 24], [27, 25], [25, 28]]
  },
  {
    name: 'Leo', nameCn: '狮子座', abbr: 'Leo',
    stars: [29, 30, 31, 32],
    lines: [[29, 31], [31, 32], [32, 30]]
  },
]

// ---------- 共用的名字与排列依据（星表 / 搜索 / 画布同一份） ----------

/** 星的中文写法（缺失时给出可见占位，绝不静默留空） */
export function starNameCn(star: Star | undefined | null): string {
  return star?.nameCn?.trim() || '未命名星'
}

/** 星的拉丁写法（缺失时给出可见占位） */
export function starNameLa(star: Star | undefined | null): string {
  return star?.name?.trim() || '(unnamed)'
}

/** 星的统一展示名：中文写法 + 拉丁写法 */
export function starDisplayName(star: Star | undefined | null): string {
  return `${starNameCn(star)} ${starNameLa(star)}`
}

/** 星座的中文写法（缺失时给出可见占位） */
export function constellationNameCn(c: Constellation | undefined | null): string {
  return c?.nameCn?.trim() || '未命名星座'
}

/** 星座的拉丁写法（缺失时给出可见占位） */
export function constellationNameLa(c: Constellation | undefined | null): string {
  return c?.name?.trim() || '(unnamed constellation)'
}

/** 星座的统一展示名：中文写法 + 拉丁写法 */
export function constellationDisplayName(c: Constellation | undefined | null): string {
  return `${constellationNameCn(c)} ${constellationNameLa(c)}`
}

export function findConstellation(key: string): Constellation | undefined {
  const k = key.trim().toLowerCase()
  return CONSTELLATIONS.find(
    c => c.name.toLowerCase() === k ||
      c.nameCn === key.trim() ||
      (c.abbr && c.abbr.toLowerCase() === k)
  )
}

/** 取星座成员，统一按亮度等级（视星等，数值越小越亮）升序排列 */
export function constellationMembersBrightnessOrdered(c: Constellation): Star[] {
  return c.stars
    .map(i => STARS[i])
    .filter((s): s is Star => Boolean(s))
    .slice()
    .sort((a, b) => a.mag - b.mag)
}

/**
 * 星表自检：名字缺失、索引越界、连线指向不存在的成员等都要暴露出来，
 * 由界面提示，而不是静默渲染成空白。
 */
export function validateCatalog(): CatalogIssue[] {
  const issues: CatalogIssue[] = []

  STARS.forEach((s, i) => {
    if (!s.name || !s.name.trim()) {
      issues.push({ level: 'error', message: `第 ${i} 颗星缺少拉丁名(name)` })
    }
    if (!s.nameCn || !s.nameCn.trim()) {
      issues.push({ level: 'error', message: `星「${s.name || `#${i}`}」缺少中文写法(nameCn)` })
    }
    if (typeof s.ra !== 'number' || Number.isNaN(s.ra) || s.ra < 0 || s.ra > 24) {
      issues.push({ level: 'error', message: `星「${s.name || `#${i}`}」赤经(ra)非法` })
    }
    if (typeof s.dec !== 'number' || Number.isNaN(s.dec) || s.dec < -90 || s.dec > 90) {
      issues.push({ level: 'error', message: `星「${s.name || `#${i}`}」赤纬(dec)非法` })
    }
    if (typeof s.mag !== 'number' || Number.isNaN(s.mag)) {
      issues.push({ level: 'error', message: `星「${s.name || `#${i}`}」亮度(mag)非法，无法排序` })
    }
  })

  CONSTELLATIONS.forEach((c) => {
    const label = c.nameCn || c.name || '(未命名星座)'
    if (!c.name || !c.name.trim()) {
      issues.push({ level: 'error', message: `星座「${label}」缺少拉丁名(name)` })
    }
    if (!c.nameCn || !c.nameCn.trim()) {
      issues.push({ level: 'error', message: `星座「${c.name || label}」缺少中文写法(nameCn)` })
    }
    c.stars.forEach((idx) => {
      if (!Number.isInteger(idx) || idx < 0 || idx >= STARS.length) {
        issues.push({ level: 'error', message: `星座「${label}」成员星索引越界：${idx}` })
      }
    })
    c.lines.forEach(([a, b]) => {
      for (const idx of [a, b]) {
        if (!Number.isInteger(idx) || idx < 0 || idx >= STARS.length) {
          issues.push({ level: 'error', message: `星座「${label}」连线引用了不存在的星索引：${idx}` })
        }
      }
    })
  })

  return issues
}
