
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
    { name: "Art & Collections" },
    { name: "Auto & Moto" },
    { name: "High-Tech" },
    { name: "Maison & Jardin" },
    { name: "Jouets & Jeux" },
    { name: "Culture & Loisirs" },
    { name: "Mode" },
];

async function main() {
    console.log("Checking categories...");
    const existing = await prisma.category.findMany();
    console.log("Existing categories:", existing);

    if (existing.length === 0) {
        console.log("Seeding categories...");
        for (const cat of CATEGORIES) {
            await prisma.category.create({
                data: cat,
            });
            console.log(`Created: ${cat.name}`);
        }
    } else {
        console.log("Categories exist. Checking for missing ones...");
        for (const cat of CATEGORIES) {
            const found = existing.find(e => e.name === cat.name);
            if (!found) {
                await prisma.category.create({ data: cat });
                console.log(`Created missing: ${cat.name}`);
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
