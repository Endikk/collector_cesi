<template>
  <div class="grid grid-cols-2 gap-3 p-1">
    <!-- Maintenabilité -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-2 border-l-4 border-blue-500 shadow-sm">
      <div class="flex items-center mb-1">
        <div class="text-xl mr-2">🛠️</div>
        <div>
          <h3 class="font-bold text-sm text-blue-700 dark:text-blue-300 leading-tight">Maintenabilité</h3>
          <p class="text-[9px] opacity-70 leading-tight">Dette Technique < 5%</p>
        </div>
      </div>
      <div class="space-y-1">
        <div class="flex justify-between items-center text-[10px]">
          <span>ESLint Strict</span>
          <span class="bg-green-100 text-green-800 text-[9px] px-1 py-0 rounded-full font-bold">0 any</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
          <div class="bg-blue-600 h-1 rounded-full" style="width: 95%"></div>
        </div>
        <p class="text-[9px] opacity-60 mt-0.5 leading-tight">Typage fort TypeScript intégral</p>
      </div>
    </div>

    <!-- Fiabilité -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-2 border-l-4 border-green-500 shadow-sm">
      <div class="flex items-center mb-1">
        <div class="text-xl mr-2">🛡️</div>
        <div>
          <h3 class="font-bold text-sm text-green-700 dark:text-green-300 leading-tight">Fiabilité</h3>
          <p class="text-[9px] opacity-70 leading-tight">Uptime > 99.9%</p>
        </div>
      </div>
      <div class="space-y-1">
        <div class="flex justify-between items-center text-[10px]">
          <span>Gestion Erreurs</span>
          <span class="bg-green-100 text-green-800 text-[9px] px-1 py-0 rounded-full font-bold">Global Filter</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
          <div class="bg-green-600 h-1 rounded-full" style="width: 100%"></div>
        </div>
        <p class="text-[9px] opacity-60 mt-0.5 leading-tight">Catch-all Exception Filter NestJS</p>
      </div>
    </div>

    <!-- Performance -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-2 border-l-4 border-purple-500 shadow-sm">
      <div class="flex items-center mb-1">
        <div class="text-xl mr-2">⚡</div>
        <div>
          <h3 class="font-bold text-sm text-purple-700 dark:text-purple-300 leading-tight">Performance</h3>
          <p class="text-[9px] opacity-70 leading-tight">API < 200ms</p>
        </div>
      </div>
      <div class="space-y-1">
        <div class="flex justify-between items-center text-[10px]">
          <span>Optimisation</span>
          <span class="bg-green-100 text-green-800 text-[9px] px-1 py-0 rounded-full font-bold">Next/Image</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
          <div class="bg-purple-600 h-1 rounded-full" style="width: 90%"></div>
        </div>
        <p class="text-[9px] opacity-60 mt-0.5 leading-tight">Logs structurés Pino (JSON)</p>
      </div>
    </div>

    <!-- Capacité -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-2 border-l-4 border-orange-500 shadow-sm">
      <div class="flex items-center mb-1">
        <div class="text-xl mr-2">🚀</div>
        <div>
          <h3 class="font-bold text-sm text-orange-700 dark:text-orange-300 leading-tight">Capacité</h3>
          <p class="text-[9px] opacity-70 leading-tight">Déploiement Hebdo</p>
        </div>
      </div>
      <div class="space-y-1">
        <div class="flex justify-between items-center text-[10px]">
          <span>Automatisation</span>
          <span class="bg-green-100 text-green-800 text-[9px] px-1 py-0 rounded-full font-bold">CI/CD</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
          <div class="bg-orange-500 h-1 rounded-full" style="width: 100%"></div>
        </div>
        <p class="text-[9px] opacity-60 mt-0.5 leading-tight">GitHub Actions Pipeline</p>
      </div>
    </div>
  </div>
</template>
