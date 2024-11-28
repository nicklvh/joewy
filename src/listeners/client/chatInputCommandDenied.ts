import { type ChatInputCommandDeniedPayload, Events, Listener, type UserError, } from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandDenied,
})
export class ChatInputCommandDeniedListener extends Listener {
  public async run(
    error: UserError,
    {interaction}: ChatInputCommandDeniedPayload
  ) {
    if (error.identifier === "preconditionCooldown") {
      if (interaction.deferred || interaction.replied) {
        return this.cooldownReply(error, interaction, "edit");
      }

      return this.cooldownReply(error, interaction, "reply");
    }
  }

  private cooldownReply(
    error: UserError,
    interaction: ChatInputCommandInteraction,
    response: "reply" | "edit"
  ) {
    const content = `Woah, slow down there! Try again in \`${
      // @ts-expect-error If statement checks if error is a cooldown error, so this is safe
      (error.context!.remaining / 1000).toFixed(1)
    } seconds\``;

    response === "reply"
      ? interaction.reply({content, ephemeral: true})
      : interaction.editReply({content});
  }
}
