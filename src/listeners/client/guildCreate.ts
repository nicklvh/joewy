import { Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
    event: Events.GuildCreate,
})
export class GuildCreateListener extends Listener {
  public run(guild: Guild) {
    return this.container.logger.info(`Joined ${guild.name} (${guild.id})`);
  }
}
