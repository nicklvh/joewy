import { Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";

export class GuildCreateListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, options);
  }

  public async run(guild: Guild) {
    await this.container.database.guild.create({ data: { id: guild.id } });
    this.container.logger.info(`Joined ${guild.name} (${guild.id})`);
  }
}
