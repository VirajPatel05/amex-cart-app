import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();

  const products = [
    {
      name: "Wireless Mouse",
      price: 499,
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7",
    },
    {
      name: "USB Keyboard",
      price: 799,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    },
    {
      name: "Laptop Stand",
      price: 1200,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
    },
    {
      name: "Type-C Hub",
      price: 1499,
      imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef",
    },
    {
      name: "HD Webcam",
      price: 2499,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    },
    {
      name: "Bluetooth Speaker",
      price: 1899,
      imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d",
    },
    {
      name: "Desk LED Lamp",
      price: 999,
      imageUrl: "https://images.unsplash.com/photo-1534349762230-e0cadfefcffc",
    },
    {
      name: "External SSD 512GB",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b",
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  // Seed sample test user for assessment review
  const bcrypt = await import("bcryptjs");
  const testPasswordHash = await bcrypt.hash("test@123", 10);

  await prisma.user.upsert({
    where: { email: "test@gmail.com" },
    update: { passwordHash: testPasswordHash },
    create: {
      name: "Test User",
      email: "test@gmail.com",
      passwordHash: testPasswordHash,
    },
  });

  console.log(
    "Database seeded with 8 products and test account (test@gmail.com / test@123) successfully!",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
