import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.GuildCreate,
})
export class GuildDeleteListener extends Listener {
  public run(guild: Guild) {
    return this.container.logger.info(`Left ${guild.name} (${guild.id})`);
  }
}
