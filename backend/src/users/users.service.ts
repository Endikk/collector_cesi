import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        items: true,
                        sales: true,
                        purchases: true,
                        reviewsReceived: true,
                    },
                },
                sales: { include: { item: true }, take: 5, orderBy: { createdAt: 'desc' } },
                purchases: { include: { item: true }, take: 5, orderBy: { createdAt: 'desc' } },
            },
        });

        if (!user) throw new NotFoundException('User not found');

        return user;
    }
}
