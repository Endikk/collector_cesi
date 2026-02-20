import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * =====================================================================
 * SCÉNARIO : LOAD TEST (Test de Charge)
 * =====================================================================
 * Objectif : Vérifier le comportement du système sous une charge
 * "normale" et maintenue dans le temps.
 * 
 * Ce test vise à prouver les SLO (Service Level Objectives) définis
 * dans la politique Qualité (ISO 25010), notamment :
 * - Latence API P95 < 500ms
 * - Taux d'erreur négligeable (< 1%)
 */

export const options = {
    // Les "stages" définissent comment la charge évolue dans le temps
    stages: [
        { duration: '30s', target: 20 }, // Étape 1 : On rampe doucement de 0 à 20 utilisateurs virtuels (VUs) en 30s
        { duration: '1m', target: 20 },  // Étape 2 : Plateau - On maintient ces 20 VUs actifs pendant 1 minute
        { duration: '15s', target: 0 },  // Étape 3 : On redescend tranquillement la charge à 0 en 15s
    ],
    // Les "thresholds" sont nos critères de réussite (Quality Gates)
    thresholds: {
        http_req_duration: ['p(95)<500'], // Objectif de perf : 95% des requêtes doivent répondre en moins de 500ms
        http_req_failed: ['rate<0.01'],   // Objectif de fiabilité : Moins de 1% des requêtes peuvent échouer
    },
};

// URL cible (par défaut: pointe vers l'API exposée en local ou sur minikube tunnel)
const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:4000';

export default function () {
    // On simule un appel utilisateur sur l'endpoint de santé (ou tout autre endpoint métier)
    const res = http.get(`${BASE_URL}/health`);

    // On valide que la réponse HTTP est bien un succès (200 OK)
    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    // Pause de 1 seconde entre chaque itération de l'utilisateur virtuel
    // (simule le temps de réflexion/lecture d'un vrai utilisateur)
    sleep(1);
}
