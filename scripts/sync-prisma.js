/* eslint-disable */
const fs = require('fs');
const path = require('path');

const backendClientPath = path.join(__dirname, '../backend/node_modules/.prisma');
const rootClientPath = path.join(__dirname, '../node_modules/.prisma');
const backendPrismaLibPath = path.join(__dirname, '../backend/node_modules/@prisma/client');
const rootPrismaLibPath = path.join(__dirname, '../node_modules/@prisma/client');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`Source directory not found: ${src}`);
        return;
    }
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('🔄 Syncing Prisma Client from backend to root...');

try {
    // Sync .prisma (Engines & Schema)
    if (fs.existsSync(backendClientPath)) {
        console.log(`Copying ${backendClientPath} -> ${rootClientPath}`);
        copyDir(backendClientPath, rootClientPath);
    }

    // Sync @prisma/client (Type definitions & index.js)
    if (fs.existsSync(backendPrismaLibPath)) {
        console.log(`Copying ${backendPrismaLibPath} -> ${rootPrismaLibPath}`);
        copyDir(backendPrismaLibPath, rootPrismaLibPath);
    }

    console.log('✅ Prisma Client synced successfully!');
} catch (err) {
    console.error('❌ Error syncing Prisma Client:', err);
    process.exit(1);
}
