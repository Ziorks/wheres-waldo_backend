const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

async function main() {
  const image = await prisma.image.create({
    data: {
      src: "https://w.wallhaven.cc/full/je/wallhaven-je82zp.jpg",
      width: 3840,
      height: 1920,
    },
  });

  const characters = await prisma.character.createManyAndReturn({
    data: [
      {
        name: "Bobby",
        avatar:
          "https://static.wikia.nocookie.net/wkbs-pbs-kids/images/c/c7/Bobby.png/revision/latest?cb=20210217232722",
        imageId: image.id,
      },
      {
        name: "Master Chief",
        avatar:
          "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/2331afef-593b-4a8e-900c-ce9e0be967fa/d1b8jn4-d069c0d0-0c9e-4122-9e52-ee29a8b24a41.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzIzMzFhZmVmLTU5M2ItNGE4ZS05MDBjLWNlOWUwYmU5NjdmYVwvZDFiOGpuNC1kMDY5YzBkMC0wYzllLTQxMjItOWU1Mi1lZTI5YThiMjRhNDEuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.hITWcXycN3D3n4DPBay0BBHCh-PtROcLQEjPPGDZcj0",
        imageId: image.id,
      },
      {
        name: "Isaac",
        avatar:
          "https://static.wikia.nocookie.net/bindingofisaac/images/a/a0/IsaacHD.png/revision/latest/thumbnail/width/360/height/450?cb=20120617101324",
        imageId: image.id,
      },
    ],
  });

  await prisma.location.createMany({
    data: [
      { x: 10, y: 20, characterId: characters[0].id },
      { x: 200, y: 400, characterId: characters[1].id },
      { x: 400, y: 60, characterId: characters[2].id },
    ],
  });

  const game = await prisma.game.create({ data: { imageId: image.id } });

  await prisma.objective.createMany({
    data: [
      { characterId: characters[0].id, gameId: game.id },
      { characterId: characters[1].id, gameId: game.id },
      { characterId: characters[2].id, gameId: game.id },
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
