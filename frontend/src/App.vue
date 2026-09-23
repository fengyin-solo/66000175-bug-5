<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div class="w-72 bg-gray-900 p-4 flex flex-col gap-4 overflow-y-auto">
      <h1 class="text-xl font-bold text-blue-400">天文星图渲染器</h1>

      <!-- 星表数据问题提示（名字缺失 / 索引错误等，不静默留空） -->
      <div v-if="store.catalogIssues.length"
        class="bg-red-950 border border-red-700 rounded-lg p-2 text-xs text-red-200">
        <p class="font-bold mb-1">星表数据存在 {{ store.catalogIssues.length }} 个问题：</p>
        <p v-for="(issue, i) in store.catalogIssues" :key="i" class="leading-5">
          · {{ issue.message }}
        </p>
      </div>

      <!-- Search：中文写法与拉丁写法都可命中，星与星座都能查到 -->
      <div>
        <input v-model="store.searchQuery" placeholder="搜索星座或恒星（中/拉丁名均可）..."
          class="w-full bg-gray-800 rounded px-3 py-2 text-sm" />
        <div v-if="store.searchResults.length" class="mt-1">
          <div v-for="(r, i) in store.searchResults" :key="i"
            @click="store.pickSearchResult(r)"
            class="bg-gray-800 p-2 rounded mt-1 cursor-pointer hover:bg-gray-700 text-sm">
            <span class="text-blue-300 text-xs mr-1">{{ r.type === 'constellation' ? '星座' : '恒星' }}</span>
            {{ r.label }}
            <span class="text-gray-400 block text-xs mt-0.5">{{ r.sub }}</span>
          </div>
        </div>
        <div v-else-if="queryTrimmed"
          class="mt-1 p-2 rounded bg-gray-800 text-xs text-amber-300">
          未找到与「{{ queryTrimmed }}」匹配的星座或恒星，请检查名称写法（中文名如「猎户座」，拉丁名如「Orion」）。
        </div>
      </div>

      <!-- Focused constellation panel：成员按亮度排序、逐步显示 -->
      <div v-if="store.focusedConstellation"
        class="bg-blue-950 border border-blue-800 rounded-xl p-3 text-sm">
        <div class="flex items-center justify-between">
          <h3 class="text-blue-300 font-bold">
            {{ store.focusedConstellation.nameCn }}
            <span class="text-blue-500 font-normal">{{ store.focusedConstellation.name }}</span>
          </h3>
          <button @click="store.clearFocus()"
            class="text-xs text-gray-400 hover:text-white">退出聚焦 ✕</button>
        </div>

        <div class="mt-2 h-1.5 bg-gray-800 rounded overflow-hidden">
          <div class="h-full bg-blue-400 transition-all"
            :style="{ width: (store.revealProgress * 100) + '%' }" />
        </div>
        <p class="text-xs text-gray-400 mt-1">
          成员按亮度等级依次显现：{{ store.revealedCount }} / {{ store.focusMembers.length }}
        </p>

        <ul class="mt-2 text-xs space-y-1">
          <li v-for="(s, i) in store.focusMembers" :key="s.name"
            :class="i < store.revealedCount ? 'text-gray-200' : 'text-gray-600'"
            @click="store.selectedStar = s"
            class="cursor-pointer hover:text-white">
            <span class="inline-block w-5 text-amber-400">{{ i + 1 }}.</span>
            {{ s.nameCn }}
            <span class="text-gray-500">{{ s.name }}</span>
            <span class="text-gray-500">· mag {{ s.mag }}</span>
            <span v-if="i >= store.revealedCount" class="text-gray-600">（待显现）</span>
          </li>
        </ul>

        <div class="flex gap-2 mt-3">
          <button @click="store.showAllMembers()"
            class="flex-1 text-xs bg-blue-800 hover:bg-blue-700 rounded px-2 py-1">全部显示</button>
          <button @click="store.replayReveal()"
            class="flex-1 text-xs bg-gray-800 hover:bg-gray-700 rounded px-2 py-1">重新逐步显示</button>
        </div>
      </div>

      <!-- Time Travel -->
      <div>
        <label class="text-gray-400 text-xs">时间旅行</label>
        <input type="datetime-local" v-model="dateStr" @input="updateDate"
          class="w-full bg-gray-800 rounded px-3 py-2 text-sm" />
      </div>

      <!-- Location -->
      <div>
        <label class="text-gray-400 text-xs">纬度: {{ store.latitude.toFixed(1) }}°</label>
        <input type="range" v-model.number="store.latitude" min="-90" max="90" step="0.1" class="w-full" />
      </div>

      <!-- Zoom -->
      <div>
        <label class="text-gray-400 text-xs">缩放: {{ store.zoom.toFixed(1) }}x</label>
        <input type="range" v-model.number="store.zoom" min="0.3" max="3" step="0.1" class="w-full" />
      </div>

      <!-- Toggles -->
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="store.showLabels" /> 星名标签
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="store.showConstLines" /> 星座连线
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="store.showGrid" /> 坐标网格
        </label>
      </div>

      <!-- Star Info -->
      <div v-if="store.selectedStar" class="bg-gray-800 rounded-xl p-3">
        <h3 class="text-amber-400 font-bold">
          {{ store.selectedStar.nameCn }}
          <span class="font-normal text-gray-400 text-sm">{{ store.selectedStar.name }}</span>
        </h3>
        <div class="text-xs text-gray-300 mt-2 space-y-1">
          <p>所属星座: {{ constellationOf(store.selectedStar) }}</p>
          <p>赤经: {{ store.selectedStar.ra.toFixed(2) }}h</p>
          <p>赤纬: {{ store.selectedStar.dec.toFixed(2) }}°</p>
          <p>视星等: {{ store.selectedStar.mag }}</p>
          <p>光谱型: {{ store.selectedStar.spectral }}</p>
        </div>
      </div>

      <!-- Constellation list：点击即聚焦，成员按亮度逐步显现 -->
      <div class="text-xs">
        <h4 class="text-gray-400 mb-1">星座（点击在画布上逐步显现）</h4>
        <div v-for="c in store.CONSTELLATIONS" :key="c.name"
          @click="store.focusConstellation(c)"
          :class="store.focusedConstellation?.name === c.name
            ? 'py-1 px-2 rounded bg-blue-900 text-blue-200 cursor-pointer'
            : 'py-1 px-2 rounded text-gray-300 cursor-pointer hover:bg-gray-800'">
          {{ c.nameCn }} <span class="text-gray-500">({{ c.name }})</span>
        </div>
      </div>

      <div class="text-xs text-gray-500 mt-auto">
        LST: {{ store.localSiderealTime.toFixed(2) }}h
      </div>
    </div>

    <!-- Sky Canvas -->
    <div class="flex-1 relative">
      <StarCanvas />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkyStore } from './store/sky'
import { constellationDisplayName } from './data/stars'
import StarCanvas from './components/StarCanvas.vue'
import type { Star } from './types'

const store = useSkyStore()
const dateStr = ref(new Date().toISOString().slice(0, 16))
function updateDate() { store.viewDate = new Date(dateStr.value) }

const queryTrimmed = computed(() => store.searchQuery.value.trim())

function constellationOf(star: Star): string {
  const c = store.CONSTELLATIONS.find(x => x.name === star.constellation)
  // 找不到归属时给明确提示，而不是空白
  return c ? constellationDisplayName(c) : '未知星座'
}
</script>
