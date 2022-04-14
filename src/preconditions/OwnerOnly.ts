import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

export class OwnerOnlyPrecondition extends Precondition {
  public run(interaction: CommandInteraction) {
    return interaction.user.id === process.env.OWNER_ID
      ? this.ok()
      : this.error({ message: "Only the bot owner can use this command! " });
  }
}
