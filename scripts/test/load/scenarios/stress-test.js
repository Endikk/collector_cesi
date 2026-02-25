import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * =====================================================================
 * SCÉNARIO : STRESS TEST (Test de Stress)
 * =====================================================================
 * Objectif : Pousser le système dans ses retranchements pour :
 * 1. Voir comment il se comporte sous forte charge (dégradation gracieuse ?)
 * 2. Déclencher et valider le fonctionnement de l'Horizontal Pod Autoscaler (HPA)
 * 3. Mesurer le temps de récupération après la charge
 */

export const options = {
    // Les paliers sont plus agressifs et visent de hauts volumes
    stages: [
        { duration: '30s', target: 50 },  // Étape 1 : On rampe "vite" à 50 utilisateurs
        { duration: '1m', target: 50 },   // Étape 2 : Plateau à 50
        { duration: '30s', target: 100 }, // Étape 3 : On pousse encore plus loin jusqu'à 100
        { duration: '1m', target: 100 },  // Étape 4 : Plateau de stress intense
        { duration: '30s', target: 0 },   // Étape 5 : Descente
    ],
    thresholds: {
        // En mode stress, on accepte des dégradations de perfs (latence plus élevée)
        http_req_duration: ['p(95)<1000'], // Tolérance plus souple : P95 < 1s
        http_req_failed: ['rate<0.05'],    // On accepte jusqu'à 5% d'erreur max sous stress extrême
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:4000';

export default function () {
    // ── 1. Health check (baseline rapide) ──
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
        'health: status 200': (r) => r.status === 200,
    });

    // ── 2. Catalogue (parcours utilisateur classique) ──
    const categoriesRes = http.get(`${BASE_URL}/items/categories`);
    check(categoriesRes, {
        'categories: status 200': (r) => r.status === 200,
    });

    // ── 3. Modération (logique métier CPU-intensive) ──
    const moderationRes = http.post(`${BASE_URL}/moderation/moderate`, JSON.stringify({
        content: 'Superbe figurine Star Wars originale en parfait état, contactez-moi pour plus de détails',
    }), { headers: { 'Content-Type': 'application/json' } });
    check(moderationRes, {
        'moderation: status 200 or 201': (r) => r.status === 200 || r.status === 201,
    });

    // ── 4. Métriques Prometheus (vérifie que /metrics tient la charge) ──
    const metricsRes = http.get(`${BASE_URL}/metrics`);
    check(metricsRes, {
        'metrics: status 200': (r) => r.status === 200,
    });

    // Pause réduite sous stress pour maximiser la charge
    sleep(0.5);
}
