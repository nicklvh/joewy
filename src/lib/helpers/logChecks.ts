import { container } from "@sapphire/framework";
import { Guild, GuildTextBasedChannel } from "discord.js";
import getGuild from "./getGuild";
import { LoggingTypes } from "../../types/types";

export default async function logChecks(
  guild: Guild,
  type: LoggingTypes,
): Promise<GuildTextBasedChannel | null> {
  const guildInDB = await getGuild(guild.id);

  if (!guildInDB.logging?.enabled || !guildInDB.logging[`${type}Id`])
    return null;

  const loggingChannel = await container.client.channels
    .fetch(guildInDB.logging[`${type}Id`]!)
    .catch(() =>
      container.logger.error(
        `Invalid ${type} channel ID for Guild ${guild.name} (${guild.id})`,
      ),
    );

  if (!loggingChannel || !loggingChannel.isTextBased()) return null;

  return loggingChannel as GuildTextBasedChannel;
}
