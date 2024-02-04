import { container } from "@sapphire/framework";
import type { Guild, GuildTextBasedChannel } from "discord.js";

export async function auditlogChecks(
  guild: Guild
): Promise<GuildTextBasedChannel | false> {
  if (!guild) return false;

  const guildInDB = await container.prisma.guild.findUnique({
    where: {
      id: guild.id,
    },
  });

  if (!guildInDB) return false;

  if (!guildInDB || !guildInDB.logging || !guildInDB.auditlogId) return false;

  const loggingChannel = await container.client.channels
    .fetch(guildInDB.auditlogId)
    .catch(() =>
      container.logger.error(
        `Invalid logging channel ID for Guild ${guild.name} (${guild.id})`
      )
    );

  if (!loggingChannel || !loggingChannel.isTextBased()) return false;

  return loggingChannel as GuildTextBasedChannel;
}
