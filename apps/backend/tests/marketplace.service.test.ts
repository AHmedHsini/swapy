import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the prisma module used by services
vi.mock('../src/config/prisma.js', () => {
  return {
    prisma: {
      listing: {
        findFirst: vi.fn(),
        findUnique: vi.fn()
      },
      user: {
        findUnique: vi.fn()
      },
      marketplaceTransaction: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn()
      },
      feedback: {
        create: vi.fn(),
        findMany: vi.fn()
      },
      trustScoreSnapshot: {
        create: vi.fn()
      }
    }
  };
});

import { marketplaceRouter } from '../src/modules/marketplace/marketplace.router.js';
import { MarketplaceService } from '../src/modules/marketplace/marketplace.service.js';
import { prisma } from '../src/config/prisma.js';
import { HttpError } from '../src/common/http-error.js';

describe('MarketplaceService.submitFeedback', () => {
  let service: MarketplaceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MarketplaceService();
  });

  it('rejects feedback when no completed transaction exists', async () => {
    (prisma.listing.findFirst as any).mockResolvedValue({ id: 'list1', userId: 'owner1' });
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'user1' });
    (prisma.marketplaceTransaction.findFirst as any).mockResolvedValue(null);

    await expect(service.submitFeedback('list1', { reviewerId: 'user1', rating: 5 })).rejects.toBeInstanceOf(HttpError);
  });

  it('creates feedback and persists trust snapshot when completed transaction exists', async () => {
    (prisma.listing.findFirst as any).mockResolvedValue({ id: 'list1', userId: 'owner1' });
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'user1', firstName: 'A', lastName: 'B', email: 'a@b', imageUrl: null, reputationScore: 0 });
    (prisma.marketplaceTransaction.findFirst as any).mockResolvedValue({ id: 'tx1', listingId: 'list1', requesterId: 'user1', ownerId: 'owner1', status: 'COMPLETED' });
    (prisma.feedback.create as any).mockResolvedValue({ id: 'f1', listingId: 'list1', reviewerId: 'user1', rating: 5 });
    (prisma.feedback.findMany as any).mockResolvedValue([{ rating: 5 }, { rating: 4 }]);
    (prisma.marketplaceTransaction.count as any).mockResolvedValue(2);
    (prisma.trustScoreSnapshot.create as any).mockResolvedValue({ id: 'snap1' });

    const result = await service.submitFeedback('list1', { reviewerId: 'user1', rating: 5 });
    expect(result).toHaveProperty('id', 'f1');
    expect(prisma.trustScoreSnapshot.create).toHaveBeenCalled();
  });
});
