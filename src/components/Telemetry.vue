<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Высота</div>
        <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
          {{ altitude }}м
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Скорость</div>
        <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
          {{ speed }}км/ч
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Траектория полета</div>
      <div class="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg">
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Крен</div>
        <div class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          {{ roll }}°
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Тангаж</div>
        <div class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          {{ pitch }}°
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Рыскание</div>
        <div class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          {{ yaw }}°
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Статус системы</div>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-300">GPS</span>
          <span class="text-sm font-medium" :class="gpsStatus ? 'text-green-600' : 'text-red-600'">
            {{ gpsStatus ? 'Подключено' : 'Отключено' }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-300">Компас</span>
          <span class="text-sm font-medium" :class="compassStatus ? 'text-green-600' : 'text-red-600'">
            {{ compassStatus ? 'Калиброван' : 'Требуется калибровка' }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-300">Аккумулятор</span>
          <span class="text-sm font-medium" :class="batteryStatus">
            {{ batteryVoltage }}V
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDroneStore } from '../stores/drone'

const store = useDroneStore()

const {
  altitude,
  speed,
  roll,
  pitch,
  yaw,
  gpsStatus,
  compassStatus,
  batteryVoltage,
  batteryStatus
} = store
</script> 