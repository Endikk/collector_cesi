import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(userId: string, limit = 20) {
    // Get user interests
    const interests = await this.prisma.userInterest.findMany({
      where: { userId },
    });

    if (interests.length === 0) {
      // No interests configured, return empty array to encourage user to configure interests
      return [];
    }

    // Build query conditions based on interests
    const categoryIds = interests
      .filter((i) => i.categoryId)
      .map((i) => i.categoryId);

    const keywords = interests.filter((i) => i.keyword).map((i) => i.keyword);

    const priceRanges = interests.filter((i) => i.minPrice || i.maxPrice);

    // Create OR conditions for matching items
    const orConditions: any[] = [];

    // Match by category
    if (categoryIds.length > 0) {
      orConditions.push({
        categoryId: { in: categoryIds },
      });
    }

    // Match by keyword in title or description
    if (keywords.length > 0) {
      keywords.forEach((keyword) => {
        orConditions.push({
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
          ],
        });
      });
    }

    // If no conditions, fallback to popular items
    if (orConditions.length === 0 && priceRanges.length === 0) {
      return this.getPopularItems(limit);
    }

    // Get items matching interests
    const recommendedItems = await this.prisma.item.findMany({
      where: {
        status: 'AVAILABLE',
        published: true,
        ownerId: { not: userId }, // Exclude user's own items
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
      },
      include: {
        images: {
          take: 1,
        },
        category: {
          select: { id: true, name: true },
        },
        owner: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
      take: limit * 2, // Get more items for filtering
    });

    // Filter by price ranges if specified
    let filteredItems = recommendedItems;
    if (priceRanges.length > 0) {
      filteredItems = recommendedItems.filter((item) =>
        priceRanges.some((range) => {
          const minValid = !range.minPrice || item.price >= range.minPrice;
          const maxValid = !range.maxPrice || item.price <= range.maxPrice;
          return minValid && maxValid;
        }),
      );
    }

    // If we have enough filtered items, return them
    if (filteredItems.length >= limit) {
      return filteredItems.slice(0, limit);
    }

    // Otherwise, return filtered items + some popular items to reach the limit
    const remainingCount = limit - filteredItems.length;
    const popularItems = await this.getPopularItems(remainingCount, [
      ...filteredItems.map((i) => i.id),
    ]);

    return [...filteredItems, ...popularItems];
  }

  private async getPopularItems(limit = 20, excludeIds: string[] = []) {
    return this.prisma.item.findMany({
      where: {
        status: 'AVAILABLE',
        published: true,
        ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      },
      include: {
        images: {
          take: 1,
        },
        category: {
          select: { id: true, name: true },
        },
        owner: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }
}
