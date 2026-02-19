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
  labels: ['GET /items', 'POST /auth', 'GET /orders', 'POST /orders', 'GET /users'],
  datasets: [
    {
      label: 'Temps de réponse moyen (ms)',
      data: [45, 120, 68, 155, 52],
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      borderRadius: 6,
    },
    {
      label: 'p95 (ms)',
      data: [82, 180, 110, 195, 90],
      backgroundColor: 'rgba(244, 114, 182, 0.7)',
      borderColor: 'rgba(244, 114, 182, 1)',
      borderWidth: 2,
      borderRadius: 6,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { size: 11, family: 'Inter, sans-serif' },
        usePointStyle: true,
        padding: 16,
      },
    },
    title: {
      display: true,
      text: 'Latence par Endpoint — 50 utilisateurs simultanés (Artillery)',
      font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' },
      padding: { bottom: 12 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}ms`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 250,
      title: {
        display: true,
        text: 'Latence (ms)',
        font: { size: 11, family: 'Inter, sans-serif' },
      },
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 10, family: 'Inter, sans-serif' } },
    },
  },
}
</script>
