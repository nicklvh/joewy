import type { Bans } from "@prisma/client";
import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";

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

        if (ban.time! < new Date()) {
          const wait =
            ban.time!.getMilliseconds() - new Date().getMilliseconds();

          setTimeout(async () => {
            await guild.bans.remove(ban.userid, "Time up");
          }, wait);
        }

        await guild.bans.remove(ban.userid, "Time up");
      });
    });

    this.container.logger.info(
      `Logged in as ${this.container.client.user!.tag} (${this.container.client
        .user!.id!})`
    );
  }
}
