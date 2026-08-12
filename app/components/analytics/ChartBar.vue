<template>
  <div class="relative w-full min-h-[250px] flex items-center justify-center">
    <Bar v-if="hasData" :data="computedChartData" :options="chartOptions" />
    <div v-else class="text-sm text-gray-400 dark:text-gray-500 py-8">
      Belum ada data untuk ditampilkan.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  labels: string[]
  data: number[]
  title?: string
  color?: string
}>()

const hasData = computed(() => props.data && props.data.some(v => v > 0))

const computedChartData = computed(() => {
  const bgColors = props.color
    ? props.color
    : [
        '#6366f1',
        '#8b5cf6',
        '#ec4899',
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#14b8a6',
        '#84cc16',
        '#06b6d4',
      ]

  return {
    labels: props.labels,
    datasets: [
      {
        label: props.title || 'Respon',
        backgroundColor: bgColors,
        borderRadius: 6,
        data: props.data,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}))
</script>
