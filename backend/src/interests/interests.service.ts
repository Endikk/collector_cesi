import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateInterestDto {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
}

@Injectable()
export class InterestsService {
  constructor(private prisma: PrismaService) {}

  async getUserInterests(userId: string) {
    return this.prisma.userInterest.findMany({
      where: { userId },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async createInterest(userId: string, data: CreateInterestDto) {
    return this.prisma.userInterest.create({
      data: {
        ...data,
        userId,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async updateInterest(
    interestId: string,
    userId: string,
    data: CreateInterestDto,
  ) {
    // Verify ownership
    const interest = await this.prisma.userInterest.findUnique({
      where: { id: interestId },
    });

    if (!interest || interest.userId !== userId) {
      throw new Error('Interest not found or access denied');
    }

    return this.prisma.userInterest.update({
      where: { id: interestId },
      data,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async deleteInterest(interestId: string, userId: string) {
    // Verify ownership
    const interest = await this.prisma.userInterest.findUnique({
      where: { id: interestId },
    });

    if (!interest || interest.userId !== userId) {
      throw new Error('Interest not found or access denied');
    }

    return this.prisma.userInterest.delete({
      where: { id: interestId },
    });
  }
}
