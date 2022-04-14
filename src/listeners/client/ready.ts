import type { Bans } from "@prisma/client";
import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import type { Guild, GuildMember } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.ClientReady,
  once: true,
})
export class ReadyListener extends Listener {
  public run() {
    void this.container.database.bans.findMany().then((bans: Bans[]): void => {
      if (!bans) return;

      bans.map(async (ban: Bans): Promise<void> => {
        if (!ban.timed) return;

        const guild: Guild = await this.container.client.guilds.fetch(
          ban.guildid
        );
        if (!guild) return;

        const member: GuildMember = await guild.members.fetch(ban.userid);

        await guild.bans.remove(member, "Time up");
      });
    });

    this.container.logger.info(
      `Logged in as ${this.container.client.user!.tag} (${this.container.client
        .user!.id!})`
    );
  }
}
