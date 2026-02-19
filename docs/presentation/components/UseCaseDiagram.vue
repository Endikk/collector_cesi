<template>
  <div class="usecase-container">
    <svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg" class="usecase-svg">
      <defs>
        <marker id="ucArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4B5563" />
        </marker>
        <filter id="ucShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1" />
        </filter>
      </defs>

      <!-- System Boundary -->
      <rect x="220" y="5" width="360" height="230" rx="10" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="5 5" />
      <text x="400" y="25" text-anchor="middle" style="font-size:11px" fill="#6366f1" font-weight="bold" font-family="Inter, sans-serif">Platform Collector.shop</text>

      <!-- Actors -->
      <!-- Vendeur -->
      <g transform="translate(140, 60)">
        <circle cx="20" cy="20" r="15" fill="#fefce8" stroke="#ca8a04" stroke-width="2" />
        <text x="20" y="25" text-anchor="middle" style="font-size:16px">👤</text>
        <text x="20" y="50" text-anchor="middle" style="font-size:10px" font-weight="bold" fill="#1f2937">Vendeur</text>
      </g>

      <!-- Acheteur -->
      <g transform="translate(140, 160)">
        <circle cx="20" cy="20" r="15" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
        <text x="20" y="25" text-anchor="middle" style="font-size:16px">👤</text>
        <text x="20" y="50" text-anchor="middle" style="font-size:10px" font-weight="bold" fill="#1f2937">Acheteur</text>
      </g>

      <!-- Admin -->
      <g transform="translate(620, 110)">
        <circle cx="20" cy="20" r="15" fill="#fef2f2" stroke="#dc2626" stroke-width="2" />
        <text x="20" y="25" text-anchor="middle" style="font-size:16px">👮</text>
        <text x="20" y="50" text-anchor="middle" style="font-size:10px" font-weight="bold" fill="#1f2937">Admin</text>
      </g>

      <!-- Use Cases -->
      <!-- UC1: Publier Annonce -->
      <ellipse cx="400" cy="60" rx="90" ry="20" fill="#fff" stroke="#ca8a04" stroke-width="1.5" filter="url(#ucShadow)" />
      <text x="400" y="63" text-anchor="middle" style="font-size:9px" fill="#1f2937" font-family="Inter, sans-serif">Publier une Annonce</text>
      <line x1="180" y1="80" x2="310" y2="60" stroke="#ca8a04" stroke-width="1.5" />

      <!-- UC2: Acheter Objet -->
      <ellipse cx="400" cy="130" rx="90" ry="20" fill="#fff" stroke="#2563eb" stroke-width="1.5" filter="url(#ucShadow)" />
      <text x="400" y="133" text-anchor="middle" style="font-size:9px" fill="#1f2937" font-family="Inter, sans-serif">Acheter Objet</text>
      <line x1="180" y1="180" x2="310" y2="130" stroke="#2563eb" stroke-width="1.5" />

      <!-- UC3: Commission -->
      <ellipse cx="400" cy="190" rx="80" ry="18" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="4 2" />
      <text x="400" y="193" text-anchor="middle" style="font-size:8px" fill="#166534" font-family="Inter, sans-serif">Commission (5%)</text>
      <text x="400" y="180" text-anchor="middle" style="font-size:6px; font-weight:bold" fill="#16a34a" font-family="Inter, sans-serif">&lt;&lt;include&gt;&gt;</text>
      <line x1="400" y1="150" x2="400" y2="172" stroke="#16a34a" stroke-width="1" stroke-dasharray="4 2" marker-end="url(#ucArrow)" />

      <!-- UC4: Modération -->
      <ellipse cx="400" cy="95" rx="80" ry="18" fill="#fff" stroke="#dc2626" stroke-width="1.5" filter="url(#ucShadow)" />
      <text x="400" y="98" text-anchor="middle" style="font-size:9px" fill="#1f2937" font-family="Inter, sans-serif">Alerte Fraude</text>
      <line x1="620" y1="130" x2="480" y2="95" stroke="#dc2626" stroke-width="1.5" />

    </svg>
  </div>
</template>

<style scoped>
.usecase-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.usecase-svg {
  width: 100%;
  max-height: 100%;
}
</style>
