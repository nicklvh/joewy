import {
  Events,
  Listener,
  type ChatInputCommandDeniedPayload,
  type UserError,
} from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";

export class ChatInputCommandDeniedListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.ChatInputCommandDenied,
    });
  }

  public async run(
    error: UserError,
    { interaction }: ChatInputCommandDeniedPayload
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
      ? interaction.reply({ content, ephemeral: true })
      : interaction.editReply({ content });
  }
}
