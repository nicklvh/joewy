import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.GuildCreate,
})
export class GuildCreateListener extends Listener {
  public async run(guild: Guild) {
    await this.container.database.guild.create({ data: { id: guild.id } });
    this.container.logger.info(`Joined ${guild.name} (${guild.id})`);
  }
}
