import { Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
  event: Events.GuildDelete,
})
export class GuildDeleteListener extends Listener {
  public run(guild: Guild) {
    return this.container.logger.info(`Left ${guild.name} (${guild.id})`);
  }
}
