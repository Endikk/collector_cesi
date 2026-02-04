import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
    constructor(private prisma: PrismaService) { }

    async getShop(sellerId: string) {
        const seller = await this.prisma.user.findUnique({
            where: { id: sellerId },
            include: {
                items: {
                    where: { published: true },
                    include: { images: true },
                },
                reviewsReceived: {
                    include: { author: true },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { sales: true, reviewsReceived: true },
                },
            },
        });

        if (!seller) throw new NotFoundException('Seller not found');

        return seller;
    }
}
