<template>
  <canvas ref="canvasRef" class="w-full h-full bg-black cursor-crosshair"
    @click="onClick" @wheel.prevent="onWheel" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSkyStore, REVEAL_STEP_MS } from '../store/sky'
import {
  starNameCn, starNameLa,
  constellationNameCn, constellationNameLa,
  constellationMembersBrightnessOrdered,
} from '../data/stars'
import type { Star, Constellation } from '../types'

const store = useSkyStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0

// 安全取星：索引缺失/越界时返回 null，由调用方跳过，绝不静默画空
function starAt(index: number): Star | null {
  return store.STARS[index] ?? null
}

/** 某颗星当前显现动画的进度 0~1（聚焦模式下按亮度顺序逐步出现） */
function revealProgressOf(rank: number, revealed: number, now: number): number {
  if (rank >= revealed) return 0
  // 当前正在显现的那一颗做一个 0→1 的缩放淡入
  const elapsed = now - store.focusStartedAt - rank * REVEAL_STEP_MS
  return Math.max(0, Math.min(1, elapsed / 350))
}

/** 帧内时间下已显现的成员数（与 store 的时钟同源，保证动画顺滑） */
function revealedAt(now: number): number {
  if (!store.focusedConstellation) return 0
  const elapsed = now - store.focusStartedAt
  return Math.max(0, Math.min(
    store.focusMembers.length,
    Math.floor(elapsed / REVEAL_STEP_MS) + 1
  ))
}

function drawStar(ctx: CanvasRenderingContext2D, star: Star, x: number, y: number, alpha: number, scale01 = 1) {
  const radius = store.starRadius(star.mag) * Math.max(0.05, scale01)
  const color = store.spectralColor(star.spectral)

  // glow
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, 'transparent')
  ctx.globalAlpha = alpha
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius * 3, 0, Math.PI * 2)
  ctx.fill()

  // core
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawStarLabel(ctx: CanvasRenderingContext2D, star: Star, x: number, y: number) {
  const radius = store.starRadius(star.mag)
  // 与侧栏/搜索共用同一份名字：中文写法 + 拉丁写法
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(220,225,255,0.9)'
  ctx.font = `${11 * store.zoom}px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif`
  ctx.fillText(starNameCn(star), x + radius + 4, y - 1)
  ctx.fillStyle = 'rgba(150,160,200,0.65)'
  ctx.font = `${9 * store.zoom}px system-ui, sans-serif`
  ctx.fillText(starNameLa(star), x + radius + 4, y + 11 * store.zoom)
}

function drawConstellationLabel(ctx: CanvasRenderingContext2D, c: Constellation, cx: number, cy: number, scale: number, onlyRevealed: boolean, revealedNow: number) {
  // 标签放在成员的平均位置（聚焦模式下只统计已显现的成员）
  let sx = 0, sy = 0, n = 0
  const ordered = constellationMembersBrightnessOrdered(c)
  for (const s of ordered) {
    if (onlyRevealed) {
      const rank = store.revealRank(s)
      if (rank === null || rank >= revealedNow) continue
    }
    const [px, py] = store.projectStar(s.ra, s.dec, cx, cy, scale)
    if (px < -500) continue
    sx += px; sy += py; n++
  }
  if (!n) return
  const lx = sx / n, ly = sy / n - 22 * store.zoom

  const cn = constellationNameCn(c)
  const la = constellationNameLa(c)
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(120,190,255,0.95)'
  ctx.font = `bold ${13 * store.zoom}px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif`
  ctx.fillText(cn, lx, ly)
  ctx.fillStyle = 'rgba(120,190,255,0.55)'
  ctx.font = `${10 * store.zoom}px system-ui, sans-serif`
  ctx.fillText(la, lx, ly + 13 * store.zoom)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) { animId = requestAnimationFrame(draw); return }
  const ctx = canvas.getContext('2d')!
  const w = canvas.width = canvas.offsetWidth * 2
  const h = canvas.height = canvas.offsetHeight * 2
  const cx = w / 2, cy = h / 2
  const scale = Math.min(w, h) * store.zoom
  const now = Date.now()

  const focus = store.focusedConstellation
  // 帧内时间下已显现的成员数（与 focusStartedAt 同为 Date.now 基准）
  const revealedNow = focus ? revealedAt(now) : 0

  // background
  ctx.fillStyle = '#000814'
  ctx.fillRect(0, 0, w, h)

  // random background stars
  const rng = (seed: number) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647 } }
  const r = rng(42)
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(255,255,255,${r() * 0.4})`
    ctx.beginPath()
    ctx.arc(r() * w, r() * h, r() * 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // grid
  if (store.showGrid && !focus) {
    ctx.strokeStyle = 'rgba(100,100,200,0.15)'
    ctx.lineWidth = 1
    for (let dec = -60; dec <= 60; dec += 30) {
      ctx.beginPath()
      for (let ra = 0; ra <= 24; ra += 0.5) {
        const [x, y] = store.projectStar(ra, dec, cx, cy, scale)
        if (x < -500) continue
        ra === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    for (let ra = 0; ra < 24; ra += 2) {
      ctx.beginPath()
      for (let dec = -90; dec <= 90; dec += 5) {
        const [x, y] = store.projectStar(ra, dec, cx, cy, scale)
        if (x < -500) continue
        dec === -90 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }

  // constellation lines
  if (store.showConstLines) {
    ctx.strokeStyle = focus ? 'rgba(120,200,255,0.75)' : 'rgba(100,180,255,0.4)'
    ctx.lineWidth = focus ? 2 : 1.5
    for (const c of store.CONSTELLATIONS) {
      // 聚焦模式下只画该星座、且两端成员都已显现的连线
      if (focus && c !== focus) continue
      for (const [i, j] of c.lines) {
        const s1 = starAt(i), s2 = starAt(j)
        if (!s1 || !s2) continue
        if (focus) {
          const r1 = store.revealRank(s1), r2 = store.revealRank(s2)
          if (r1 === null || r2 === null || r1 >= revealedNow || r2 >= revealedNow) continue
        }
        const [x1, y1] = store.projectStar(s1.ra, s1.dec, cx, cy, scale)
        const [x2, y2] = store.projectStar(s2.ra, s2.dec, cx, cy, scale)
        if (x1 < -500 || x2 < -500) continue
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }
  }

  // stars
  for (const star of store.STARS) {
    // 聚焦模式下隐藏其他星座，成员按亮度顺序逐步显现
    const rank = focus ? store.revealRank(star) : null
    if (focus && (rank === null || rank >= revealedNow)) continue
    const [x, y] = store.projectStar(star.ra, star.dec, cx, cy, scale)
    if (x < -500 || x > w + 500 || y < -500 || y > h + 500) continue

    const p = focus && rank !== null ? revealProgressOf(rank, revealedNow, now) : 1
    drawStar(ctx, star, x, y, focus ? p : 1, focus ? 0.4 + 0.6 * p : 1)

    if (store.showLabels) {
      if (focus || star.mag < 2.5) drawStarLabel(ctx, star, x, y)
    }
  }

  // horizon
  if (!focus) {
    ctx.strokeStyle = 'rgba(0,200,100,0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let az = 0; az <= 360; az += 5) {
      const azRad = az * Math.PI / 180
      const r = (Math.PI / 2) * scale * 0.45
      const x = cx + store.panX + r * Math.sin(azRad)
      const y = cy + store.panY - r * Math.cos(azRad)
      az === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // constellation labels（与侧栏共用同一份名字）
  if (store.showLabels) {
    for (const c of store.CONSTELLATIONS) {
      if (focus && c !== focus) continue
      drawConstellationLabel(ctx, c, cx, cy, scale, Boolean(focus), revealedNow)
    }
  }

  animId = requestAnimationFrame(draw)
}

function onClick(e: MouseEvent) {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const x = (e.clientX - rect.left) * 2
  const y = (e.clientY - rect.top) * 2
  const cx = canvas.width / 2, cy = canvas.height / 2
  const scale = Math.min(canvas.width, canvas.height) * store.zoom
  store.selectStar(x, y, cx, cy, scale)
}

function onWheel(e: WheelEvent) {
  store.zoom = Math.max(0.3, Math.min(3, store.zoom + (e.deltaY > 0 ? -0.1 : 0.1)))
}

onMounted(() => draw())
onUnmounted(() => cancelAnimationFrame(animId))
</script>
