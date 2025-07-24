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
  const vector2ds = await prisma.vector2d.createManyAndReturn({
    data: [
      { x: 3, y: 6 },
      { x: 949, y: 1342 },
      { x: 2842, y: 1951 },
      { x: 1741, y: 766 },
      { x: 1275, y: 1679 },
      { x: 1948, y: 954 },
      { x: 2901, y: 705 },
      { x: 2767, y: 1623 },
      { x: 674, y: 1535 },
      { x: 426, y: 1276 },
      { x: 1906, y: 2204 },
      { x: 1558, y: 1320 },
    ],
  });

  const image = await prisma.image.create({
    data: {
      name: "Videogame Icons",
      src: "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750737349/evbkszblprjybz0bvhqg.jpg",
      width: 3631,
      height: 2336,
      vector2dId: vector2ds[0].id,
    },
  });

  await prisma.character.createMany({
    data: [
      {
        name: "2B",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815845/uglqzyfkbavlg5pf7wkv.png",
        imageId: image.id,
        vector2dId: vector2ds[1].id,
      },
      {
        name: "Clank",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815851/gpapvmu6kvi8n4ioc3nw.png",
        imageId: image.id,
        vector2dId: vector2ds[2].id,
      },
      {
        name: "Doomguy",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815859/ygheetrrosrcq1cqbze6.png",
        imageId: image.id,
        vector2dId: vector2ds[3].id,
      },
      {
        name: "Ico",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815865/ky6bmeyxmakmwlevma2t.png",
        imageId: image.id,
        vector2dId: vector2ds[4].id,
      },
      {
        name: "Isaac",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815870/omuqx7bofbg6xbl9sjvk.png",
        imageId: image.id,
        vector2dId: vector2ds[5].id,
      },
      {
        name: "Jim Raynor",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815877/yidjkttq9uwcbfg1lm6v.png",
        imageId: image.id,
        vector2dId: vector2ds[6].id,
      },
      {
        name: "Kratos",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815882/zbcmuoyb0tqvko7uyxyc.png",
        imageId: image.id,
        vector2dId: vector2ds[7].id,
      },
      {
        name: "Manny Calavera",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815887/p20pqfhhafnrqnjyvqdh.png",
        imageId: image.id,
        vector2dId: vector2ds[8].id,
      },
      {
        name: "Marcus Fenix",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815891/h65ttq0jt6bvbq0ypxe4.png",
        imageId: image.id,
        vector2dId: vector2ds[9].id,
      },
      {
        name: "The Prince",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815895/aazdddrii24nytipmd95.png",
        imageId: image.id,
        vector2dId: vector2ds[10].id,
      },
      {
        name: "Solaire of Astora",
        avatar:
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1750815900/i5mlfs3uv6vbrbz7v9ig.png",
        imageId: image.id,
        vector2dId: vector2ds[11].id,
      },
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
