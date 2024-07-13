import { container } from "@sapphire/framework";

export default async function getGuild(guildId: string) {
  let guild = await container.prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      logging: true,
      starboard: true,
      fun: true,
      modlogs: true,
    },
  });

  if (!guild) {
    guild = await container.prisma.guild.create({
      data: {
        id: guildId,
        starboard: { create: {} },
        logging: { create: {} },
        fun: { create: {} },
      },
      include: {
        logging: true,
        starboard: true,
        fun: true,
        modlogs: true,
      },
    });
  }

  return guild;
}
