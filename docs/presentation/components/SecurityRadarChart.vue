<template>
  <div class="w-full h-full flex items-center justify-center">
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const chartData = {
  labels: [
    'Injection SQL',
    'XSS',
    'Brute Force',
    'CSRF',
    'Data Leaks',
    'DDoS',
  ],
  datasets: [
    {
      label: 'V1 (Actuel)',
      data: [95, 85, 40, 70, 80, 25],
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointRadius: 4,
    },
    {
      label: 'V2 (Cible)',
      data: [98, 95, 90, 90, 95, 85],
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 2,
      borderDash: [5, 5],
      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
      pointRadius: 4,
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
      text: 'Couverture Sécurité — V1 vs Cible V2',
      font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' },
      padding: { bottom: 8 },
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20,
        font: { size: 9 },
        backdropColor: 'transparent',
      },
      pointLabels: {
        font: { size: 11, weight: 'bold', family: 'Inter, sans-serif' },
      },
      grid: { color: 'rgba(0,0,0,0.08)' },
    },
  },
}
</script>
