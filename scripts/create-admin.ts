import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for admin user...");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@collector.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        if (existingAdmin.role !== "ADMIN") {
            console.log("Updating existing user to ADMIN role...");
            await prisma.user.update({
                where: { email: adminEmail },
                data: { role: "ADMIN" },
            });
            console.log(`✅ User ${adminEmail} is now an ADMIN`);
        } else {
            console.log(`✅ Admin user already exists: ${adminEmail}`);
        }
    } else {
        console.log("Creating admin user...");
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: "Administrateur",
                role: "ADMIN",
            },
        });

        console.log(`✅ Admin user created: ${admin.email}`);
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   🔐 Please change the password after first login!`);
    }
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
