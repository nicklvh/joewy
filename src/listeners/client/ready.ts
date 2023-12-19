import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import type { Client } from "discord.js";

@ApplyOptions<Listener.Options>({
  once: true,
  event: Events.ClientReady,
})
export class ReadyListener extends Listener {
  public run(client: Client) {
    return this.container.logger.info(`Logged in as ${client.user!.tag}`);
  }
}
