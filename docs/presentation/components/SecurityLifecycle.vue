<template>
  <div class="flow-container">
    <svg viewBox="0 0 820 340" xmlns="http://www.w3.org/2000/svg" class="flow-svg">
      <defs>
        <marker id="fArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
        </marker>
        <filter id="fShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1" />
        </filter>
      </defs>

      <!-- Background -->
      <rect x="0" y="0" width="820" height="340" rx="12" fill="#fafafa" stroke="#e5e7eb" stroke-width="1" />

      <!-- Phase labels at top -->
      <rect x="30" y="15" width="180" height="30" rx="8" fill="#eff6ff" stroke="#93c5fd" stroke-width="1" />
      <text x="120" y="35" text-anchor="middle" style="font-size:11px" fill="#1e40af" font-weight="bold" font-family="Inter, sans-serif">Planification</text>

      <rect x="230" y="15" width="150" height="30" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1" />
      <text x="305" y="35" text-anchor="middle" style="font-size:11px" fill="#166534" font-weight="bold" font-family="Inter, sans-serif">Code</text>

      <rect x="400" y="15" width="200" height="30" rx="8" fill="#fefce8" stroke="#fde68a" stroke-width="1" />
      <text x="500" y="35" text-anchor="middle" style="font-size:11px" fill="#92400e" font-weight="bold" font-family="Inter, sans-serif">Build &amp; Test</text>

      <rect x="620" y="15" width="170" height="30" rx="8" fill="#fef2f2" stroke="#fecaca" stroke-width="1" />
      <text x="705" y="35" text-anchor="middle" style="font-size:11px" fill="#991b1b" font-weight="bold" font-family="Inter, sans-serif">Deploiement</text>

      <!-- Arrows between phases -->
      <line x1="210" y1="30" x2="228" y2="30" stroke="#6366f1" stroke-width="1.5" marker-end="url(#fArrow)" />
      <line x1="380" y1="30" x2="398" y2="30" stroke="#6366f1" stroke-width="1.5" marker-end="url(#fArrow)" />
      <line x1="600" y1="30" x2="618" y2="30" stroke="#6366f1" stroke-width="1.5" marker-end="url(#fArrow)" />

      <!-- Phase 1: Planification -->
      <rect x="30" y="60" width="180" height="125" rx="8" fill="#fff" stroke="#3b82f6" stroke-width="1.5" filter="url(#fShadow)" />
      <text x="120" y="82" text-anchor="middle" style="font-size:10px" fill="#3b82f6" font-weight="bold" font-family="Inter, sans-serif">MESURES DE SECURITE</text>
      <line x1="50" y1="90" x2="190" y2="90" stroke="#e5e7eb" stroke-width="1" />
      <text x="50" y="110" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Analyse des risques</text>
      <text x="50" y="130" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Revue des exigences</text>
      <text x="50" y="150" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Threat Modeling</text>
      <text x="50" y="170" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Security by Design</text>

      <!-- Phase 2: Code -->
      <rect x="230" y="60" width="150" height="125" rx="8" fill="#fff" stroke="#22c55e" stroke-width="1.5" filter="url(#fShadow)" />
      <text x="305" y="82" text-anchor="middle" style="font-size:10px" fill="#22c55e" font-weight="bold" font-family="Inter, sans-serif">MESURES DE SECURITE</text>
      <line x1="250" y1="90" x2="360" y2="90" stroke="#e5e7eb" stroke-width="1" />
      <text x="250" y="110" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">ESLint Strict</text>
      <text x="250" y="130" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Zod Validation</text>
      <text x="250" y="150" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Argon2 Hash</text>
      <text x="250" y="170" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Helmet Headers</text>

      <!-- Phase 3: Build -->
      <rect x="400" y="60" width="200" height="125" rx="8" fill="#fff" stroke="#f59e0b" stroke-width="1.5" filter="url(#fShadow)" />
      <text x="500" y="82" text-anchor="middle" style="font-size:10px" fill="#f59e0b" font-weight="bold" font-family="Inter, sans-serif">MESURES DE SECURITE</text>
      <line x1="420" y1="90" x2="580" y2="90" stroke="#e5e7eb" stroke-width="1" />
      <text x="420" y="110" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Jest + Supertest</text>
      <text x="420" y="130" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">npm audit (SCA)</text>
      <text x="420" y="150" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">SAST (trivy fs)</text>
      <text x="420" y="170" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Playwright E2E</text>

      <!-- Phase 4: Deploy -->
      <rect x="620" y="60" width="170" height="125" rx="8" fill="#fff" stroke="#ef4444" stroke-width="1.5" filter="url(#fShadow)" />
      <text x="705" y="82" text-anchor="middle" style="font-size:10px" fill="#ef4444" font-weight="bold" font-family="Inter, sans-serif">MESURES DE SECURITE</text>
      <line x1="640" y1="90" x2="770" y2="90" stroke="#e5e7eb" stroke-width="1" />
      <text x="640" y="110" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">trivy image</text>
      <text x="640" y="130" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Secrets Manager</text>
      <text x="640" y="150" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">Docker Registry</text>
      <text x="640" y="170" style="font-size:10px" fill="#374151" font-family="Inter, sans-serif">HTTPS/TLS</text>

      <!-- Bottom: Shift Left concept -->
      <rect x="30" y="210" width="760" height="50" rx="8" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5" />
      <line x1="720" y1="235" x2="100" y2="235" stroke="#6366f1" stroke-width="3" marker-end="url(#fArrow)" />
      <text x="410" y="250" text-anchor="middle" style="font-size:10px" fill="#4f46e5" font-weight="bold" font-family="Inter, sans-serif">SHIFT LEFT : Detecter les failles le plus tot possible = Cout de correction 10x inferieur</text>

      <!-- Tools row -->
      <rect x="30" y="275" width="760" height="50" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="1" filter="url(#fShadow)" />
      <text x="55" y="297" style="font-size:10px" fill="#1e293b" font-weight="bold" font-family="Inter, sans-serif">Outils :</text>
      <rect x="120" y="285" width="70" height="22" rx="6" fill="#f0fdf4" stroke="#86efac" />
      <text x="155" y="300" text-anchor="middle" style="font-size:9px" fill="#166534" font-weight="600" font-family="Inter, sans-serif">ESLint</text>
      <rect x="200" y="285" width="55" height="22" rx="6" fill="#f0fdf4" stroke="#86efac" />
      <text x="227" y="300" text-anchor="middle" style="font-size:9px" fill="#166534" font-weight="600" font-family="Inter, sans-serif">Zod</text>
      <rect x="265" y="285" width="60" height="22" rx="6" fill="#fefce8" stroke="#fde68a" />
      <text x="295" y="300" text-anchor="middle" style="font-size:9px" fill="#92400e" font-weight="600" font-family="Inter, sans-serif">Jest</text>
      <rect x="335" y="285" width="65" height="22" rx="6" fill="#fefce8" stroke="#fde68a" />
      <text x="367" y="300" text-anchor="middle" style="font-size:9px" fill="#92400e" font-weight="600" font-family="Inter, sans-serif">Trivy</text>
      <rect x="410" y="285" width="70" height="22" rx="6" fill="#fef2f2" stroke="#fecaca" />
      <text x="445" y="300" text-anchor="middle" style="font-size:9px" fill="#991b1b" font-weight="600" font-family="Inter, sans-serif">Helmet</text>
      <rect x="490" y="285" width="70" height="22" rx="6" fill="#fef2f2" stroke="#fecaca" />
      <text x="525" y="300" text-anchor="middle" style="font-size:9px" fill="#991b1b" font-weight="600" font-family="Inter, sans-serif">Argon2</text>
      <rect x="570" y="285" width="85" height="22" rx="6" fill="#eef2ff" stroke="#c7d2fe" />
      <text x="612" y="300" text-anchor="middle" style="font-size:9px" fill="#4f46e5" font-weight="600" font-family="Inter, sans-serif">Playwright</text>
      <rect x="665" y="285" width="108" height="22" rx="6" fill="#eef2ff" stroke="#c7d2fe" />
      <text x="719" y="300" text-anchor="middle" style="font-size:9px" fill="#4f46e5" font-weight="600" font-family="Inter, sans-serif">npm audit</text>
    </svg>
  </div>
</template>

<style scoped>
.flow-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flow-svg {
  width: 100%;
  max-height: 100%;
}
</style>
