<template>
  <div class="grid grid-cols-2 gap-3 p-1">
    <!-- Docker -->
    <div class="bg-blue-50 dark:bg-gray-800 rounded-lg p-2 border border-blue-100 dark:border-blue-900 flex items-start space-x-2">
      <div class="text-xl bg-white dark:bg-gray-700 p-1 rounded-md shadow-sm">🐳</div>
      <div>
        <div class="flex items-center space-x-2">
          <h3 class="font-bold text-xs text-gray-800 dark:text-white">Docker Compose</h3>
          <span class="bg-green-100 text-green-800 text-[9px] px-1 py-0 rounded-full font-bold border border-green-200">VALIDÉ</span>
        </div>
        <p class="text-[9px] text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
          <strong>vs K8s/Minikube</strong>
          <br>Choisi pour la portabilité immédiate et la simplicité d'orchestration locale (4 services).
        </p>
      </div>
    </div>

    <!-- Prisma -->
    <div class="bg-indigo-50 dark:bg-gray-800 rounded-lg p-2 border border-indigo-100 dark:border-indigo-900 flex items-start space-x-2">
      <div class="text-xl bg-white dark:bg-gray-700 p-1 rounded-md shadow-sm">💎</div>
      <div>
        <div class="flex items-center space-x-2">
          <h3 class="font-bold text-xs text-gray-800 dark:text-white">Prisma ORM</h3>
          <span class="bg-green-100 text-green-800 text-[9px] px-1 py-0 rounded-full font-bold border border-green-200">VALIDÉ</span>
        </div>
        <p class="text-[9px] text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
          <strong>vs TypeORM</strong>
          <br>Type-safety de bout en bout, migrations automatiques et introspection BDD fiable.
        </p>
      </div>
    </div>

    <!-- NextAuth -->
    <div class="bg-purple-50 dark:bg-gray-800 rounded-lg p-2 border border-purple-100 dark:border-purple-900 flex items-start space-x-2">
      <div class="text-xl bg-white dark:bg-gray-700 p-1 rounded-md shadow-sm">🔐</div>
      <div>
        <div class="flex items-center space-x-2">
          <h3 class="font-bold text-xs text-gray-800 dark:text-white">NextAuth.js</h3>
          <span class="bg-green-100 text-green-800 text-[9px] px-1 py-0 rounded-full font-bold border border-green-200">VALIDÉ</span>
        </div>
        <p class="text-[9px] text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
          <strong>Authentification</strong>
          <br>Gestion OAuth + JWT sécurisé sans gérer la complexité crypto manuellement.
        </p>
      </div>
    </div>

    <!-- Stripe -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 flex items-start space-x-2">
      <div class="text-xl bg-white dark:bg-gray-700 p-1 rounded-md shadow-sm">💳</div>
      <div>
        <div class="flex items-center space-x-2">
          <h3 class="font-bold text-xs text-gray-800 dark:text-white">Stripe API</h3>
          <span class="bg-green-100 text-green-800 text-[9px] px-1 py-0 rounded-full font-bold border border-green-200">SANDBOX OK</span>
        </div>
        <p class="text-[9px] text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
          <strong>Paiement</strong>
          <br>Webhooks testés avec CLI. Cantonnement des fonds et commission 5% fonctionnels.
        </p>
      </div>
    </div>
  </div>
</template>
