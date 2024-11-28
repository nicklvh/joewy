import { Events, Listener } from "@sapphire/framework";
import type { Client } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
  event: Events.ClientReady,
})
export class ReadyListener extends Listener {
  public run(client: Client) {
    return this.container.logger.info(`Logged in as ${client.user!.tag}!`);
  }
}
