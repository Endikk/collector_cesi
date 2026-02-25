import { prisma } from "@/lib/prisma";
import { sendResponse } from "@/lib/api-response";

export async function GET() {
    try {
        // Check Database connection
        await prisma.$queryRaw`SELECT 1`;

        return sendResponse(200, {
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected",
            version: "1.0.0"
        });
    } catch {
        return sendResponse(503, {
            status: "error",
            timestamp: new Date().toISOString(),
            database: "disconnected"
        }, "Database connection failed");
    }
}
