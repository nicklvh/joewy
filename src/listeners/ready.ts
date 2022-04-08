import { Listener } from "@sapphire/framework";

export class ReadyListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
    });
  }

  public run() {
    this.container.database.bans.findMany().then((bans) => {
      if (!bans) return;

      bans.map(async (ban) => {
        if (!ban.timed) return;

        const guild = await this.container.client.guilds.fetch(ban.guildid);

        if (!guild) return;

        const member = await guild.members.fetch(ban.userid);

        guild.bans.remove(member, "Time up");
      });
    });

    this.container.logger.info(
      `Logged in as ${this.container.client.user!.tag} (${this.container.client
        .user!.id!})`
    );
  }
}
