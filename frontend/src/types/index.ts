export interface Star {
  name: string       // 拉丁名（国际通用写法）
  nameCn: string     // 中文写法
  ra: number         // right ascension in hours (0-24)
  dec: number        // declination in degrees (-90 to +90)
  mag: number        // apparent magnitude (lower = brighter)
  spectral: string
  constellation?: string  // 所属星座（拉丁名），便于检索与提示
}

export interface Constellation {
  name: string       // 拉丁名
  nameCn: string     // 中文写法
  abbr?: string      // IAU 三字母缩写（如 Ori）
  stars: number[]    // indices into star array
  lines: [number, number][]  // pairs of star indices
}

export type SearchResultType = 'star' | 'constellation'

export interface SearchResult {
  type: SearchResultType
  /** 统一展示名：中文写法 + 拉丁写法 */
  label: string
  sub: string
  star?: Star
  constellation?: Constellation
}

export type CatalogIssueLevel = 'error' | 'warning'

export interface CatalogIssue {
  level: CatalogIssueLevel
  message: string
}
