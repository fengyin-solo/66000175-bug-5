<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div class="w-72 bg-gray-900 p-4 flex flex-col gap-4 overflow-y-auto">
      <h1 class="text-xl font-bold text-blue-400">天文星图渲染器</h1>

      <!-- Search -->
      <div>
        <input v-model="store.searchQuery" placeholder="搜索星座或恒星（中文 / 拉丁名）..."
          class="w-full bg-gray-800 rounded px-3 py-2 text-sm" />

        <!-- 未输入：给出可输入写法的提示 -->
        <p v-if="store.searchState === 'idle'" class="text-xs text-gray-500 mt-1">
          支持中文名（如 猎户座）与拉丁名（如 Orion）；命中星座后按亮度逐级列出成员星。
        </p>

        <!-- 有输入但无命中：明确提示，不静默留空 -->
        <p v-else-if="store.searchState === 'empty'" class="text-xs text-amber-400 mt-1">
          未找到「{{ store.activeQuery }}」，请检查是否按错了键。可试试：猎户座 / Orion / Betelgeuse。
        </p>

        <template v-else>
          <!-- 命中星座：成员按亮度排序，逐步显示 -->
          <div v-if="store.matchedConstellation" class="mt-1 bg-gray-800 rounded p-2">
            <div class="text-blue-300 text-sm font-bold">
              {{ store.constellationLabel(store.matchedConstellation) }}
            </div>
            <div class="text-xs text-gray-500 mb-1">成员星 · 按亮度排序</div>
            <div v-for="s in store.visibleMembers" :key="s.name"
              @click="store.selectedStar = s"
              class="member-item bg-gray-700/60 px-2 py-1.5 rounded mt-1 cursor-pointer hover:bg-gray-700 text-sm flex justify-between">
              <span>{{ s.name }}</span>
              <span class="text-gray-400">mag {{ s.mag }}</span>
            </div>
          </div>

          <!-- 命中恒星 -->
          <div v-if="store.matchedStars.length" class="mt-1">
            <div v-for="s in store.matchedStars" :key="s.name"
              @click="store.selectedStar = s"
              class="bg-gray-800 p-2 rounded mt-1 cursor-pointer hover:bg-gray-700 text-sm">
              {{ s.name }} <span class="text-gray-400">mag {{ s.mag }}</span>
            </div>
          </div>
        </template>
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
        <h3 class="text-amber-400 font-bold">{{ store.selectedStar.name }}</h3>
        <div class="text-xs text-gray-300 mt-2 space-y-1">
          <p>赤经: {{ store.selectedStar.ra.toFixed(2) }}h</p>
          <p>赤纬: {{ store.selectedStar.dec.toFixed(2) }}°</p>
          <p>视星等: {{ store.selectedStar.mag }}</p>
          <p>光谱型: {{ store.selectedStar.spectral }}</p>
        </div>
      </div>

      <!-- Constellation list -->
      <div class="text-xs">
        <h4 class="text-gray-400 mb-1">可见星座</h4>
        <div v-for="c in store.CONSTELLATIONS" :key="c.name"
          @click="store.selectConstellation(c)"
          class="py-1 cursor-pointer hover:text-blue-300"
          :class="store.matchedConstellation?.name === c.name ? 'text-amber-300' : 'text-gray-300'">
          {{ store.constellationLabel(c) }}
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
import { ref } from 'vue'
import { useSkyStore } from './store/sky'
import StarCanvas from './components/StarCanvas.vue'

const store = useSkyStore()
const dateStr = ref(new Date().toISOString().slice(0, 16))
function updateDate() { store.viewDate = new Date(dateStr.value) }
</script>

<style scoped>
.member-item {
  animation: member-in 0.25s ease-out;
}
@keyframes member-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
