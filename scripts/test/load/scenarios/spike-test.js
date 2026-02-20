import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * =====================================================================
 * SCÉNARIO : SPIKE TEST (Test de Pic)
 * =====================================================================
 * Objectif : Tester le comportement du système lors d'une arrivée
 * massive et très soudaine de trafic (ex: mise en vente exclusive d'un objet collector).
 * 
 * Permet de valider que :
 * - Le système ne s'effondre pas (Timeout)
 * - Les files d'attentes (si présentes) gèrent le surplus
 */

export const options = {
    stages: [
        { duration: '10s', target: 10 },  // Trafic nominal de base
        { duration: '30s', target: 200 }, // PIC BRUTAL : passage de 10 à 200 VUs en 30s
        { duration: '1m', target: 200 },  // Maintien du pic pour voir si le système survit
        { duration: '30s', target: 10 },  // Redescente rapide au trafic nominal
        { duration: '10s', target: 0 },   // Arrêt
    ],
};

const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:4000';

export default function () {
    // ── 1. Health check (rapide, faible coût) ──
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
        'health: status 200': (r) => r.status === 200,
    });

    // ── 2. Parcours catalogue (scénario réaliste : afflux de visiteurs) ──
    const categoriesRes = http.get(`${BASE_URL}/items/categories`);
    check(categoriesRes, {
        'categories: responds': (r) => r.status === 200 || r.status < 500,
    });

    // ── 3. Vérification modération (simule un afflux de messages) ──
    const moderationRes = http.post(`${BASE_URL}/moderation/check`, JSON.stringify({
        content: 'Je veux acheter cette figurine rare ! Mon email est test@test.com',
    }), { headers: { 'Content-Type': 'application/json' } });
    check(moderationRes, {
        'moderation: responds': (r) => r.status === 200 || r.status === 201 || r.status < 500,
    });

    // ── 4. Recommandations (endpoint avec logique DB) ──
    const recoRes = http.get(`${BASE_URL}/recommendations`, {
        headers: { 'x-user-id': 'spike-test-user' },
    });
    check(recoRes, {
        'recommendations: responds': (r) => r.status < 500,
    });

    // Pause minimale pour maximiser le pic
    sleep(0.3);
}
