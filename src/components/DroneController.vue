<template>
  <div class="relative">
    <div class="mb-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Статус подключения</span>
        <div class="flex items-center space-x-2">
          <span
            class="text-sm font-medium"
            :class="{
              'text-red-600': connectionStatus === 'disconnected',
              'text-yellow-600': connectionStatus === 'connecting',
              'text-green-600': connectionStatus === 'connected'
            }"
          >
            {{ connectionStatusText }}
          </span>
          <button
            v-if="!isConnected"
            class="btn btn-primary"
            @click="connectToDevice"
            :disabled="connectionStatus === 'connecting'"
          >
            Подключить
          </button>
          <button
            v-else
            class="btn btn-secondary"
            @click="disconnect"
          >
            Отключить
          </button>
        </div>
      </div>
      <div v-if="deviceName" class="mt-1 text-sm text-gray-500">
        {{ deviceName }}
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div
        ref="leftStickRef"
        class="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
        @mousedown="startStickDrag('left', $event)"
        @mousemove="updateStickDrag('left', $event)"
        @mouseup="stopStickDrag"
        @mouseleave="stopStickDrag"
        @touchstart.prevent="startStickDrag('left', $event)"
        @touchmove.prevent="updateStickDrag('left', $event)"
        @touchend.prevent="stopStickDrag"
      >
        <div
          class="absolute w-16 h-16 bg-primary-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          :style="{
            left: `${leftStick.x}%`,
            top: `${leftStick.y}%`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }"
        ></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full"></div>
        </div>
      </div>

      <div
        ref="rightStickRef"
        class="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
        @mousedown="startStickDrag('right', $event)"
        @mousemove="updateStickDrag('right', $event)"
        @mouseup="stopStickDrag"
        @mouseleave="stopStickDrag"
        @touchstart.prevent="startStickDrag('right', $event)"
        @touchmove.prevent="updateStickDrag('right', $event)"
        @touchend.prevent="stopStickDrag"
      >
        <div
          class="absolute w-16 h-16 bg-primary-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          :style="{
            left: `${rightStick.x}%`,
            top: `${rightStick.y}%`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }"
        ></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-3 gap-4">
      <button
        v-for="(button, index) in buttons"
        :key="index"
        class="btn"
        :class="button.active ? 'btn-primary' : 'btn-secondary'"
        @mousedown="handleButtonDown(button)"
        @mouseup="handleButtonUp(button)"
        @mouseleave="handleButtonUp(button)"
        :disabled="!isConnected"
      >
        {{ button.label }}
      </button>
    </div>

    <div class="mt-6 space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Режим полета</span>
        <span class="text-sm text-primary-600">{{ flightMode }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Уровень заряда</span>
        <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary-500"
            :style="{ width: `${batteryLevel}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDroneStore } from '../stores/drone'

const store = useDroneStore()

const isDragging = ref(false)
const activeStick = ref<'left' | 'right' | null>(null)
const leftStickRef = ref<HTMLElement | null>(null)
const rightStickRef = ref<HTMLElement | null>(null)

const connectionStatusText = computed(() => {
  switch (store.connectionStatus) {
    case 'disconnected':
      return 'Отключено'
    case 'connecting':
      return 'Подключение...'
    case 'connected':
      return 'Подключено'
  }
})

function getStickPosition(event: MouseEvent | TouchEvent, stickRef: HTMLElement): { x: number; y: number } {
  const rect = stickRef.getBoundingClientRect()
  let clientX: number
  let clientY: number
  
  if ('touches' in event) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  } else {
    clientX = event.clientX
    clientY = event.clientY
  }
  
  const x = ((clientX - rect.left) / rect.width) * 100
  const y = ((clientY - rect.top) / rect.height) * 100
  
  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y))
  }
}

function startStickDrag(stick: 'left' | 'right', event: MouseEvent | TouchEvent) {
  isDragging.value = true
  activeStick.value = stick
  updateStickPosition(stick, event)
}

function updateStickDrag(stick: 'left' | 'right', event: MouseEvent | TouchEvent) {
  if (isDragging.value && activeStick.value === stick) {
    updateStickPosition(stick, event)
  }
}

function stopStickDrag() {
  if (isDragging.value && activeStick.value) {
    const stick = activeStick.value
    store.updateStickPosition(stick, 50, 50)
  }
  isDragging.value = false
  activeStick.value = null
}

function updateStickPosition(stick: 'left' | 'right', event: MouseEvent | TouchEvent) {
  const stickRef = stick === 'left' ? leftStickRef.value : rightStickRef.value
  if (!stickRef) return
  
  const { x, y } = getStickPosition(event, stickRef)
  store.updateStickPosition(stick, x, y)
}

function handleButtonDown(button: { label: string; active: boolean }) {
  button.active = true
  store.sendButtonCommand(button.label, true)
}

function handleButtonUp(button: { label: string; active: boolean }) {
  button.active = false
  store.sendButtonCommand(button.label, false)
}

const {
  isConnected,
  deviceName,
  connectionStatus,
  leftStick,
  rightStick,
  flightMode,
  batteryLevel,
  connectToDevice,
  disconnect
} = store

const buttons = ref([
  { label: 'TAKE_OFF', active: false },
  { label: 'LAND', active: false },
  { label: 'RTH', active: false },
])

onMounted(() => {
  document.addEventListener('mouseup', stopStickDrag)
  document.addEventListener('touchend', stopStickDrag)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', stopStickDrag)
  document.removeEventListener('touchend', stopStickDrag)
})
</script> 