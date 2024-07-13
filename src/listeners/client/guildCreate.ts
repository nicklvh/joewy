import { Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";

export class GuildCreateListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.GuildCreate,
    });
  }

  public run(guild: Guild) {
    return this.container.logger.info(`Joined ${guild.name} (${guild.id})`);
  }
}
