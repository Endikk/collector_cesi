import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [users, items, transactions] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.item.count(),
            this.prisma.transaction.count(),
        ]);

        return {
            users,
            items,
            transactions,
        };
    }

    async getUsers() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async deleteUser(userId: string) {
        return this.prisma.user.delete({
            where: { id: userId },
        });
    }
}
