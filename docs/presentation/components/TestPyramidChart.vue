<template>
  <div class="w-full h-full flex items-center justify-center">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const chartData = {
  labels: ['Unitaires (Jest)', 'Intégration (Supertest)', 'E2E (Playwright)'],
  datasets: [
    {
      label: 'Répartition des tests (%)',
      data: [80, 15, 5],
      backgroundColor: [
        'rgba(34, 197, 94, 0.75)',
        'rgba(250, 204, 21, 0.75)',
        'rgba(239, 68, 68, 0.75)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(250, 204, 21, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
      borderRadius: 6,
    },
  ],
}

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Pyramide des Tests — Répartition Stratégique',
      font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' },
      padding: { bottom: 16 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.raw}% du total des tests`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: 'Pourcentage (%)',
        font: { size: 11, family: 'Inter, sans-serif' },
      },
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
    y: {
      grid: { display: false },
      ticks: {
        font: { size: 12, weight: 'bold', family: 'Inter, sans-serif' },
      },
    },
  },
}
</script>
