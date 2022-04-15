import { ApplyOptions } from "@sapphire/decorators";
import {
  Listener,
  ChatInputCommandDeniedPayload,
  UserError,
  Events,
} from "@sapphire/framework";
import type { GuildMember } from "discord.js";
import ms from "ms";
import { JoewyEmbed } from "../../structures";
import { missingPerms } from "../../structures/missingPerms";

@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandDenied,
})
export class ChatInputCommandDeniedListener extends Listener {
  public async run(
    error: UserError,
    { interaction, context }: ChatInputCommandDeniedPayload
  ): Promise<void> {
    if (error.identifier === "preconditionCooldown") {
      const { remaining } = error.context as any;

      const embed: JoewyEmbed = new JoewyEmbed(false)
        .setAuthor({
          name: "Oops...",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `You're on cool down! Please wait \`${ms(remaining as number, {
            long: true,
          })}\``
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (error.identifier === "preconditionGuildOnly") {
      const embed: JoewyEmbed = new JoewyEmbed(false)
        .setAuthor({
          name: "Oops...",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `The \`${context.commandName}\` command can only be used in a server.`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (error.identifier === "preconditionUserPermissions") {
      const { missing } = error.context as any;

      const embed: JoewyEmbed = new JoewyEmbed(false)
        .setAuthor({
          name: "Oops...",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `You're missing the following permissions: ${missingPerms(
            interaction.member as GuildMember,
            missing
          )}`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (error.identifier === "preconditionClientPermissions") {
      const { missing } = error.context as any;

      const embed: JoewyEmbed = new JoewyEmbed(false)
        .setAuthor({
          name: "Oops...",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `I'm missing the following permissions: ${missingPerms(
            interaction.guild?.me as GuildMember,
            missing
          )}`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
