import { Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";

export class GuildDeleteListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.GuildDelete,
    });
  }

  public run(guild: Guild) {
    return this.container.logger.info(`Left ${guild.name} (${guild.id})`);
  }
}
