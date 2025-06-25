require("dotenv").config();
const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const image = await prisma.image.create({
    data: {
      src: "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750737349/evbkszblprjybz0bvhqg.jpg",
      width: 3631,
      height: 2336,
    },
  });

  const characters = await prisma.character.createManyAndReturn({
    data: [
      {
        name: "2B",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815845/uglqzyfkbavlg5pf7wkv.png",
        imageId: image.id,
      },
      {
        name: "Clank",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815851/gpapvmu6kvi8n4ioc3nw.png",
        imageId: image.id,
      },
      {
        name: "Doomguy",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815859/ygheetrrosrcq1cqbze6.png",
        imageId: image.id,
      },
      {
        name: "Ico",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815865/ky6bmeyxmakmwlevma2t.png",
        imageId: image.id,
      },
      {
        name: "Isaac",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815870/omuqx7bofbg6xbl9sjvk.png",
        imageId: image.id,
      },
      {
        name: "Jim Raynor",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815877/yidjkttq9uwcbfg1lm6v.png",
        imageId: image.id,
      },
      {
        name: "Kratos",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815882/zbcmuoyb0tqvko7uyxyc.png",
        imageId: image.id,
      },
      {
        name: "Manny Calavera",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815887/p20pqfhhafnrqnjyvqdh.png",
        imageId: image.id,
      },
      {
        name: "Marcus Fenix",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815891/h65ttq0jt6bvbq0ypxe4.png",
        imageId: image.id,
      },
      {
        name: "The Prince",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815895/aazdddrii24nytipmd95.png",
        imageId: image.id,
      },
      {
        name: "Solaire of Astora",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815900/i5mlfs3uv6vbrbz7v9ig.png",
        imageId: image.id,
      },
    ],
  });

  await prisma.location.createMany({
    data: [
      { x: 949, y: 1342, characterId: characters[0].id },
      { x: 2842, y: 1951, characterId: characters[1].id },
      { x: 1741, y: 766, characterId: characters[2].id },
      { x: 1275, y: 1679, characterId: characters[3].id },
      { x: 1948, y: 954, characterId: characters[4].id },
      { x: 2901, y: 705, characterId: characters[5].id },
      { x: 2767, y: 1623, characterId: characters[6].id },
      { x: 674, y: 1535, characterId: characters[7].id },
      { x: 426, y: 1276, characterId: characters[8].id },
      { x: 1906, y: 2204, characterId: characters[9].id },
      { x: 1558, y: 1320, characterId: characters[10].id },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
