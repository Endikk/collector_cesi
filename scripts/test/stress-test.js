/**
 * Simple Stress Test Script
 * Usage: node stress-test.js
 */

const TARGET_URL = 'http://localhost:3000'; // Adjust if needed
const CONCURRENT_USERS = 50;
const TOTAL_REQUESTS = 500;

console.log(`🚀 Lancement du test de charge sur ${TARGET_URL}`);
console.log(`👉 Utilisateurs simultanés: ${CONCURRENT_USERS}`);
console.log(`👉 Objectif de requêtes: ${TOTAL_REQUESTS}`);

let completed = 0;
let errors = 0;
const times = [];

async function simulateUser(id) {
    const start = performance.now();
    try {
        const res = await fetch(TARGET_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const duration = performance.now() - start;
        times.push(duration);
    } catch (e) {
        errors++;
        console.error(`❌ User ${id} failed:`, e.message);
    } finally {
        completed++;
        process.stdout.write(`\rProgress: ${completed}/${TOTAL_REQUESTS} (Errors: ${errors})`);
    }
}

async function run() {
    const startTime = performance.now();

    // Create a pool of promises
    const queue = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i);

    // Process queue with limited concurrency
    const workers = Array(CONCURRENT_USERS).fill(null).map(async () => {
        while (queue.length > 0) {
            const id = queue.shift();
            if (id !== undefined) await simulateUser(id);
        }
    });

    await Promise.all(workers);

    const totalTime = (performance.now() - startTime) / 1000;
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

    console.log('\n\n✨ Test Terminé !');
    console.log(`-------------------------------------------`);
    console.log(`⏱️  Durée Totale: ${totalTime.toFixed(2)}s`);
    console.log(`✅ Requêtes Réussies: ${completed - errors}`);
    console.log(`❌ Requêtes Echouées: ${errors}`);
    console.log(`Requêtes/sec: ${(completed / totalTime).toFixed(2)}`);
    console.log(`Latence Moy.: ${avgTime.toFixed(2)}ms`);
    console.log(`Latence P95: ${p95?.toFixed(2)}ms`);
    console.log(`-------------------------------------------`);
}

run().catch(console.error);
