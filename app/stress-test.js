/**
 * Simple Stress Test Script
 * Usage: node stress-test.js
 */

const TARGET_URL = 'http://localhost:3000'; // Adjust if needed
const CONCURRENT_USERS = 50;
const TOTAL_REQUESTS = 500;

console.log(`🚀 Starting stress test on ${TARGET_URL}`);
console.log(`👉 Concurrent Users: ${CONCURRENT_USERS}`);
console.log(`👉 Total Requests target: ${TOTAL_REQUESTS}`);

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
        // console.error(`❌ User ${id} failed:`, e.message);
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

    console.log('\n\n✨ Test Completed!');
    console.log(`-------------------------------------------`);
    console.log(`⏱️  Total Duration: ${totalTime.toFixed(2)}s`);
    console.log(`✅ Successful Requests: ${completed - errors}`);
    console.log(`❌ Failed Requests: ${errors}`);
    console.log(`Requests/sec: ${(completed / totalTime).toFixed(2)}`);
    console.log(`Avg Latency: ${avgTime.toFixed(2)}ms`);
    console.log(`P95 Latency: ${p95?.toFixed(2)}ms`);
    console.log(`-------------------------------------------`);
}

run().catch(console.error);
