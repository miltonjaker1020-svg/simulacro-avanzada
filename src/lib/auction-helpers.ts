import { prisma } from "./prisma";
import { AuctionStatus } from "@prisma/client";

export async function checkAndUpdateAuctionStatus(auctionId?: string) {
  const now = new Date();

  if (auctionId) {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { bids: true },
    });

    if (!auction) return null;

    if (auction.status === AuctionStatus.ACTIVA && now >= auction.endDate) {
      if (auction.bids.length > 0) {
        await prisma.auction.update({
          where: { id: auctionId },
          data: { status: AuctionStatus.CERRADA },
        });
        return { ...auction, status: AuctionStatus.CERRADA };
      } else {
        await prisma.auction.update({
          where: { id: auctionId },
          data: { status: AuctionStatus.DESIERTA },
        });
        return { ...auction, status: AuctionStatus.DESIERTA };
      }
    }
    return auction;
  }

  // Update all expired active auctions
  const expiredAuctions = await prisma.auction.findMany({
    where: {
      status: AuctionStatus.ACTIVA,
      endDate: {
        lte: now,
      },
    },
    include: { bids: true },
  });

  for (const auction of expiredAuctions) {
    if (auction.bids.length > 0) {
      await prisma.auction.update({
        where: { id: auction.id },
        data: { status: AuctionStatus.CERRADA },
      });
    } else {
      await prisma.auction.update({
        where: { id: auction.id },
        data: { status: AuctionStatus.DESIERTA },
      });
    }
  }

  return expiredAuctions.length;
}

export function maskAlias(alias: string): string {
  if (!alias || alias.length <= 2) return alias + "***";
  return alias.substring(0, 2) + "***" + alias.substring(alias.length - 1);
}
