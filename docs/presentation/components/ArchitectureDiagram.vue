<template>
  <div class="arch-container">
    <svg viewBox="0 0 820 480" xmlns="http://www.w3.org/2000/svg" class="arch-svg">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
        </marker>
        <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1" />
        </filter>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#f1f5f9" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect x="0" y="0" width="820" height="480" rx="12" fill="url(#bgGrad)" stroke="#e2e8f0" stroke-width="1" />

      <!-- Client Section -->
      <rect x="330" y="15" width="160" height="55" rx="10" fill="#fff" stroke="#94a3b8" stroke-width="1.5" filter="url(#shadow)" />
      <text x="410" y="38" text-anchor="middle" style="font-size:10px" fill="#64748b" font-family="Inter, sans-serif">CLIENT</text>
      <text x="410" y="55" text-anchor="middle" style="font-size:13px" fill="#1e293b" font-weight="bold" font-family="Inter, sans-serif">Navigateur Web</text>

      <!-- Cluster Border -->
      <rect x="30" y="100" width="760" height="365" rx="12" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="8 4" />
      <rect x="50" y="88" width="200" height="24" rx="6" fill="url(#headerGrad)" />
      <text x="150" y="105" text-anchor="middle" style="font-size:11px" fill="white" font-weight="bold" font-family="Inter, sans-serif">Docker Compose Cluster</text>

      <!-- Nginx -->
      <rect x="310" y="130" width="200" height="60" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5" filter="url(#shadow)" />
      <text x="410" y="155" text-anchor="middle" style="font-size:10px" fill="#64748b" font-family="Inter, sans-serif">REVERSE PROXY</text>
      <text x="410" y="175" text-anchor="middle" style="font-size:13px" fill="#334155" font-weight="bold" font-family="Inter, sans-serif">Nginx</text>

      <!-- Frontend -->
      <rect x="80" y="240" width="220" height="80" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)" />
      <rect x="80" y="240" width="220" height="26" rx="10" fill="#3b82f6" />
      <rect x="80" y="256" width="220" height="2" fill="#3b82f6" />
      <text x="190" y="259" text-anchor="middle" style="font-size:11px" fill="white" font-weight="bold" font-family="Inter, sans-serif">FRONTEND</text>
      <text x="190" y="286" text-anchor="middle" style="font-size:14px" fill="#1e40af" font-weight="bold" font-family="Inter, sans-serif">Next.js (App Router)</text>
      <text x="190" y="305" text-anchor="middle" style="font-size:10px" fill="#3b82f6" font-family="Inter, sans-serif">SSR / SEO / React / TailwindCSS</text>

      <!-- Backend -->
      <rect x="520" y="240" width="220" height="80" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="2" filter="url(#shadow)" />
      <rect x="520" y="240" width="220" height="26" rx="10" fill="#22c55e" />
      <rect x="520" y="256" width="220" height="2" fill="#22c55e" />
      <text x="630" y="259" text-anchor="middle" style="font-size:11px" fill="white" font-weight="bold" font-family="Inter, sans-serif">BACKEND</text>
      <text x="630" y="286" text-anchor="middle" style="font-size:14px" fill="#166534" font-weight="bold" font-family="Inter, sans-serif">NestJS API</text>
      <text x="630" y="305" text-anchor="middle" style="font-size:10px" fill="#22c55e" font-family="Inter, sans-serif">REST / Guards / Prisma ORM</text>

      <!-- PostgreSQL -->
      <rect x="420" y="380" width="170" height="65" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2" filter="url(#shadow)" />
      <text x="505" y="405" text-anchor="middle" style="font-size:10px" fill="#6366f1" font-family="Inter, sans-serif">BASE DE DONNEES</text>
      <text x="505" y="425" text-anchor="middle" style="font-size:14px" fill="#4338ca" font-weight="bold" font-family="Inter, sans-serif">PostgreSQL</text>
      <text x="505" y="440" text-anchor="middle" style="font-size:9px" fill="#6366f1" font-family="Inter, sans-serif">ACID / Relations / Migrations</text>

      <!-- Redis -->
      <rect x="640" y="380" width="130" height="65" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="2" filter="url(#shadow)" />
      <text x="705" y="405" text-anchor="middle" style="font-size:10px" fill="#ef4444" font-family="Inter, sans-serif">CACHE</text>
      <text x="705" y="425" text-anchor="middle" style="font-size:14px" fill="#b91c1c" font-weight="bold" font-family="Inter, sans-serif">Redis</text>
      <text x="705" y="440" text-anchor="middle" style="font-size:9px" fill="#ef4444" font-family="Inter, sans-serif">Rate Limit / Sessions</text>

      <!-- Arrows -->
      <!-- Client -> Nginx -->
      <line x1="410" y1="70" x2="410" y2="128" stroke="#6366f1" stroke-width="2" marker-end="url(#arrow)" />
      <rect x="365" y="87" width="90" height="18" rx="4" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1" />
      <text x="410" y="100" text-anchor="middle" style="font-size:9px" fill="#4f46e5" font-weight="600" font-family="Inter, sans-serif">HTTPS/TLS</text>

      <!-- Nginx -> Frontend -->
      <line x1="350" y1="190" x2="240" y2="238" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)" />
      <rect x="245" y="200" width="70" height="18" rx="4" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1" />
      <text x="280" y="213" text-anchor="middle" style="font-size:9px" fill="#2563eb" font-weight="600" font-family="Inter, sans-serif">HTTP</text>

      <!-- Nginx -> Backend -->
      <line x1="470" y1="190" x2="580" y2="238" stroke="#22c55e" stroke-width="2" marker-end="url(#arrow)" />
      <rect x="490" y="200" width="80" height="18" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1" />
      <text x="530" y="213" text-anchor="middle" style="font-size:9px" fill="#16a34a" font-weight="600" font-family="Inter, sans-serif">API /api/*</text>

      <!-- Frontend -> Backend (SSR) -->
      <line x1="300" y1="275" x2="518" y2="275" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#arrow)" />
      <rect x="360" y="262" width="80" height="16" rx="4" fill="#faf5ff" stroke="#e9d5ff" stroke-width="1" />
      <text x="400" y="274" text-anchor="middle" style="font-size:8px" fill="#7c3aed" font-weight="600" font-family="Inter, sans-serif">SSR Fetch</text>

      <!-- Backend -> PostgreSQL -->
      <line x1="600" y1="320" x2="530" y2="378" stroke="#6366f1" stroke-width="2" marker-end="url(#arrow)" />
      <rect x="530" y="340" width="60" height="16" rx="4" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1" />
      <text x="560" y="352" text-anchor="middle" style="font-size:8px" fill="#4f46e5" font-weight="600" font-family="Inter, sans-serif">Prisma</text>

      <!-- Backend -> Redis -->
      <line x1="670" y1="320" x2="700" y2="378" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow)" />
      <rect x="668" y="340" width="55" height="16" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1" />
      <text x="695" y="352" text-anchor="middle" style="font-size:8px" fill="#dc2626" font-weight="600" font-family="Inter, sans-serif">Cache</text>
    </svg>
  </div>
</template>

<style scoped>
.arch-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.arch-svg {
  width: 100%;
  max-height: 100%;
}
</style>
