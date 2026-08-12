<template>
  <div class="relative w-full h-60 sm:h-64 flex items-center justify-center p-2">
    <Doughnut v-if="hasData" :data="computedChartData" :options="chartOptions" />
    <div v-else class="text-sm text-gray-400 dark:text-gray-500 py-8">
      Belum ada data untuk ditampilkan.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import type { TooltipItem } from 'chart.js'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps<{
  labels: string[]
  data: number[]
  title?: string
}>()

const hasData = computed(() => props.data && props.data.some(v => v > 0))

const defaultColors = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#06b6d4', // Cyan
]

const computedChartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.title || 'Respon',
      backgroundColor: defaultColors.slice(0, props.labels.length),
      borderWidth: 2,
      borderColor: 'transparent',
      hoverOffset: 4,
      data: props.data,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 10,
        padding: 12,
        font: {
          size: 11,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'doughnut'>) => {
          const label = context.label || ''
          const value = typeof context.parsed === 'number' ? context.parsed : 0
          const rawData = (context.dataset.data || []) as number[]
          const total = rawData.reduce((a: number, b: number) => a + b, 0)
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0
          return `${label}: ${value} (${percentage}%)`
        },
      },
    },
  },
}))
</script>
