import { PrismaClient, Role, AuctionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpiar base de datos previa
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const userPasswordHash = await bcrypt.hash('User123!', 10);

  // 1. Crear Administrador y Usuarios
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bidhub.com',
      passwordHash,
      name: 'Admin BidHub',
      alias: 'AdminBoss',
      role: Role.ADMIN,
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'vendedor@bidhub.com',
      passwordHash: userPasswordHash,
      name: 'Carlos Vendedor',
      alias: 'CharliV',
      role: Role.USER,
    },
  });

  const bidder1 = await prisma.user.create({
    data: {
      email: 'postor1@bidhub.com',
      passwordHash: userPasswordHash,
      name: 'Ana Postora',
      alias: 'AnaP',
      role: Role.USER,
    },
  });

  // 2. Crear Categorías
  const catCartas = await prisma.category.create({
    data: { name: 'Cartas Coleccionables', description: 'Cartas de Pokémon, Magic, Yu-Gi-Oh!' },
  });
  const catRelojes = await prisma.category.create({
    data: { name: 'Relojes Vintage', description: 'Relojes antiguos y de colección' },
  });

  const now = new Date();

  // 3. Subasta ACTIVA (con oferta)
  const subastaActiva = await prisma.auction.create({
    data: {
      title: 'Charizard Primera Edición 1999',
      description: 'Carta en estado casi impecable (PSA 9).',
      initialPrice: 500.0,
      minIncrement: 25.0,
      closingDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Cierra en 3 días
      status: AuctionStatus.ACTIVA,
      sellerId: seller.id,
      categoryId: catCartas.id,
    },
  });

  await prisma.bid.create({
    data: {
      amount: 525.0,
      auctionId: subastaActiva.id,
      bidderId: bidder1.id,
    },
  });

  // 4. Subasta CERRADA (fecha cumplida con oferta ganadora)
  const subastaCerrada = await prisma.auction.create({
    data: {
      title: 'Reloj Omega Seamaster 1960',
      description: 'Reloj automático funcionando perfectamente.',
      initialPrice: 1200.0,
      minIncrement: 50.0,
      closingDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Cerró hace 2 días
      status: AuctionStatus.CERRADA,
      sellerId: seller.id,
      categoryId: catRelojes.id,
    },
  });

  await prisma.bid.create({
    data: {
      amount: 1300.0,
      auctionId: subastaCerrada.id,
      bidderId: bidder1.id,
    },
  });

  // 5. Subasta DESIERTA (fecha cumplida sin ofertas)
  await prisma.auction.create({
    data: {
      title: 'Carta Magic: Black Lotus Réplica',
      description: 'Réplica de exhibición sin ofertas.',
      initialPrice: 2000.0,
      minIncrement: 100.0,
      closingDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Cerró ayer
      status: AuctionStatus.DESIERTA,
      sellerId: seller.id,
      categoryId: catCartas.id,
    },
  });

  // 6. Subasta CANCELADA por Administrador
  await prisma.auction.create({
    data: {
      title: 'Reloj de Imitación no autorizado',
      description: 'Publicación cancelada por infracción de reglas.',
      initialPrice: 100.0,
      minIncrement: 10.0,
      closingDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      status: AuctionStatus.CANCELADA,
      cancelReason: 'Artículo sospechoso de falsificación tras reporte.',
      sellerId: seller.id,
      categoryId: catRelojes.id,
    },
  });

  console.log('Seed completado exitosamente.');
  console.log('Admin creado: admin@bidhub.com / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
