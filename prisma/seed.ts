import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@bidhub.com" },
    update: {},
    create: {
      email: "admin@bidhub.com",
      passwordHash: adminPassword,
      name: "Administrador",
      alias: "Admin",
      role: "ADMIN",
    },
  });

  console.log("Created admin:", admin.email);

  // Create categories
  const categories = [
    { name: "Monedas", description: "Monedas antiguas y conmemorativas" },
    { name: "Sellos", description: "Sellos postales y coleccionables" },
    { name: "Figuras", description: "Figuras de acción y estatuillas" },
    { name: "Relojes", description: "Relojes vintage y de colección" },
    { name: "Tarjetas", description: "Tarjetas coleccionables" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log("Created categories");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
