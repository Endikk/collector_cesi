<template>
  <div class="pipeline-container">
    <svg viewBox="0 0 820 400" xmlns="http://www.w3.org/2000/svg" class="pipeline-svg">
      <defs>
        <marker id="pArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
        </marker>
        <filter id="pShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.12" />
        </filter>
        <linearGradient id="pBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fafafa" />
          <stop offset="100%" stop-color="#f5f5f5" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect x="0" y="0" width="820" height="400" rx="12" fill="url(#pBg)" stroke="#e5e7eb" stroke-width="1" />

      <!-- Title bar -->
      <rect x="0" y="0" width="820" height="36" rx="12" fill="#1e293b" />
      <rect x="0" y="20" width="820" height="16" fill="#1e293b" />
      <circle cx="20" cy="18" r="5" fill="#ef4444" />
      <circle cx="38" cy="18" r="5" fill="#f59e0b" />
      <circle cx="56" cy="18" r="5" fill="#22c55e" />
      <text x="410" y="23" text-anchor="middle" style="font-size:12px" fill="#94a3b8" font-family="Inter, sans-serif" font-weight="600">GitHub Actions - CI/CD Pipeline</text>

      <!-- Trigger -->
      <rect x="30" y="55" width="120" height="50" rx="10" fill="#fff" stroke="#94a3b8" stroke-width="1.5" filter="url(#pShadow)" />
      <text x="90" y="77" text-anchor="middle" style="font-size:10px" fill="#64748b" font-family="Inter, sans-serif">TRIGGER</text>
      <text x="90" y="93" text-anchor="middle" style="font-size:11px" fill="#1e293b" font-weight="bold" font-family="Inter, sans-serif">git push</text>

      <!-- Arrow Trigger -> Stage 1 -->
      <line x1="150" y1="80" x2="185" y2="80" stroke="#6366f1" stroke-width="2" marker-end="url(#pArrow)" />

      <!-- Stage 1: Quality -->
      <rect x="190" y="50" width="140" height="110" rx="10" fill="#fff" stroke="#22c55e" stroke-width="2" filter="url(#pShadow)" />
      <rect x="190" y="50" width="140" height="28" rx="10" fill="#22c55e" />
      <rect x="190" y="68" width="140" height="2" fill="#22c55e" />
      <text x="260" y="70" text-anchor="middle" style="font-size:11px" fill="white" font-weight="bold" font-family="Inter, sans-serif">1. Qualite</text>
      <text x="260" y="95" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">npm ci</text>
      <text x="260" y="115" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">npm run lint</text>
      <text x="260" y="135" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">npm run typecheck</text>
      <text x="260" y="152" text-anchor="middle" style="font-size:8px" fill="#22c55e" font-weight="600" font-family="Inter, sans-serif">= Maintenabilite</text>

      <!-- Arrow 1 -> 2 -->
      <line x1="330" y1="105" x2="355" y2="105" stroke="#6366f1" stroke-width="2" marker-end="url(#pArrow)" />

      <!-- Stage 2: Tests -->
      <rect x="360" y="50" width="140" height="110" rx="10" fill="#fff" stroke="#3b82f6" stroke-width="2" filter="url(#pShadow)" />
      <rect x="360" y="50" width="140" height="28" rx="10" fill="#3b82f6" />
      <rect x="360" y="68" width="140" height="2" fill="#3b82f6" />
      <text x="430" y="70" text-anchor="middle" style="font-size:11px" fill="white" font-weight="bold" font-family="Inter, sans-serif">2. Tests</text>
      <text x="430" y="100" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Jest (Unitaires)</text>
      <text x="430" y="120" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Supertest (Integr.)</text>
      <text x="430" y="152" text-anchor="middle" style="font-size:8px" fill="#3b82f6" font-weight="600" font-family="Inter, sans-serif">= Fiabilite</text>

      <!-- Arrow 2 -> 3 -->
      <line x1="500" y1="105" x2="525" y2="105" stroke="#6366f1" stroke-width="2" marker-end="url(#pArrow)" />

      <!-- Stage 3: Security -->
      <rect x="530" y="50" width="140" height="110" rx="10" fill="#fff" stroke="#ef4444" stroke-width="2" filter="url(#pShadow)" />
      <rect x="530" y="50" width="140" height="28" rx="10" fill="#ef4444" />
      <rect x="530" y="68" width="140" height="2" fill="#ef4444" />
      <text x="600" y="70" text-anchor="middle" style="font-size:11px" fill="white" font-weight="bold" font-family="Inter, sans-serif">3. Securite</text>
      <text x="600" y="100" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">npm audit</text>
      <text x="600" y="120" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">trivy fs (SAST)</text>
      <text x="600" y="152" text-anchor="middle" style="font-size:8px" fill="#ef4444" font-weight="600" font-family="Inter, sans-serif">= Conformite</text>

      <!-- Arrow 3 -> 4 -->
      <line x1="670" y1="105" x2="695" y2="105" stroke="#6366f1" stroke-width="2" marker-end="url(#pArrow)" />

      <!-- Stage 4: Delivery -->
      <rect x="700" y="50" width="105" height="110" rx="10" fill="#fff" stroke="#f59e0b" stroke-width="2" filter="url(#pShadow)" />
      <rect x="700" y="50" width="105" height="28" rx="10" fill="#f59e0b" />
      <rect x="700" y="68" width="105" height="2" fill="#f59e0b" />
      <text x="752" y="70" text-anchor="middle" style="font-size:11px" fill="white" font-weight="bold" font-family="Inter, sans-serif">4. Livraison</text>
      <text x="752" y="100" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">docker build</text>
      <text x="752" y="120" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">trivy image</text>
      <text x="752" y="140" text-anchor="middle" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">docker push</text>
      <text x="752" y="155" text-anchor="middle" style="font-size:8px" fill="#f59e0b" font-weight="600" font-family="Inter, sans-serif">= Capacite</text>

      <!-- Bottom: Gate indicators -->
      <rect x="30" y="195" width="775" height="55" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      <text x="50" y="218" style="font-size:11px" fill="#1e293b" font-weight="bold" font-family="Inter, sans-serif">Quality Gates :</text>

      <!-- Gate badges -->
      <rect x="180" y="203" width="130" height="22" rx="11" fill="#dcfce7" stroke="#22c55e" stroke-width="1" />
      <text x="245" y="218" text-anchor="middle" style="font-size:9px" fill="#166534" font-weight="600" font-family="Inter, sans-serif">0 Erreur ESLint</text>

      <rect x="325" y="203" width="130" height="22" rx="11" fill="#dbeafe" stroke="#3b82f6" stroke-width="1" />
      <text x="390" y="218" text-anchor="middle" style="font-size:9px" fill="#1e40af" font-weight="600" font-family="Inter, sans-serif">Tests 100% Pass</text>

      <rect x="470" y="203" width="145" height="22" rx="11" fill="#fef2f2" stroke="#ef4444" stroke-width="1" />
      <text x="542" y="218" text-anchor="middle" style="font-size:9px" fill="#991b1b" font-weight="600" font-family="Inter, sans-serif">0 Faille Critique</text>

      <rect x="630" y="203" width="155" height="22" rx="11" fill="#fefce8" stroke="#f59e0b" stroke-width="1" />
      <text x="707" y="218" text-anchor="middle" style="font-size:9px" fill="#92400e" font-weight="600" font-family="Inter, sans-serif">Image Scan Clean</text>

      <!-- Indicator mapping -->
      <rect x="30" y="270" width="775" height="115" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1" filter="url(#pShadow)" />
      <text x="410" y="295" text-anchor="middle" style="font-size:12px" fill="#1e293b" font-weight="bold" font-family="Inter, sans-serif">Mapping Pipeline > Indicateurs Qualite ISO 25010</text>

      <!-- Indicator boxes -->
      <rect x="50" y="310" width="160" height="60" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5" />
      <text x="130" y="332" text-anchor="middle" style="font-size:10px" fill="#166534" font-weight="bold" font-family="Inter, sans-serif">Maintenabilite</text>
      <text x="130" y="350" text-anchor="middle" style="font-size:9px" fill="#22c55e" font-family="Inter, sans-serif">ESLint 0 erreur</text>
      <text x="130" y="363" text-anchor="middle" style="font-size:9px" fill="#22c55e" font-family="Inter, sans-serif">TypeCheck OK</text>

      <rect x="230" y="310" width="160" height="60" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
      <text x="310" y="332" text-anchor="middle" style="font-size:10px" fill="#1e40af" font-weight="bold" font-family="Inter, sans-serif">Fiabilite</text>
      <text x="310" y="350" text-anchor="middle" style="font-size:9px" fill="#3b82f6" font-family="Inter, sans-serif">Tests Pass 100%</text>
      <text x="310" y="363" text-anchor="middle" style="font-size:9px" fill="#3b82f6" font-family="Inter, sans-serif">Coverage > 70%</text>

      <rect x="410" y="310" width="160" height="60" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5" />
      <text x="490" y="332" text-anchor="middle" style="font-size:10px" fill="#991b1b" font-weight="bold" font-family="Inter, sans-serif">Performance</text>
      <text x="490" y="350" text-anchor="middle" style="font-size:9px" fill="#ef4444" font-family="Inter, sans-serif">API &lt; 200ms</text>
      <text x="490" y="363" text-anchor="middle" style="font-size:9px" fill="#ef4444" font-family="Inter, sans-serif">0 Vulnerabilite</text>

      <rect x="590" y="310" width="195" height="60" rx="8" fill="#fefce8" stroke="#f59e0b" stroke-width="1.5" />
      <text x="687" y="332" text-anchor="middle" style="font-size:10px" fill="#92400e" font-weight="bold" font-family="Inter, sans-serif">Capacite</text>
      <text x="687" y="350" text-anchor="middle" style="font-size:9px" fill="#f59e0b" font-family="Inter, sans-serif">Deploy Hebdo</text>
      <text x="687" y="363" text-anchor="middle" style="font-size:9px" fill="#f59e0b" font-family="Inter, sans-serif">Image Docker OK</text>
    </svg>
  </div>
</template>

<style scoped>
.pipeline-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pipeline-svg {
  width: 100%;
  max-height: 100%;
}
</style>
