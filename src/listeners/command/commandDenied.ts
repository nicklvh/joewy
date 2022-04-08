import {
  Listener,
  ChatInputCommandDeniedPayload,
  UserError,
} from "@sapphire/framework";
import type { GuildMember } from "discord.js";
import ms from "ms";
import { JoewyEmbed } from "../../structures/JoewyEmbed";
import { missingPerms } from "../../structures/missingPerms";

export class ChatInputCommandDeniedListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      name: "chatInputCommandDenied",
    });
  }

  public async run(
    error: UserError,
    { interaction, context }: ChatInputCommandDeniedPayload
  ): Promise<void> {
    console.log(error.identifier);
    if (error.identifier === "preconditionCooldown") {
      const { remaining } = error.context as any;

      const embed: JoewyEmbed = new JoewyEmbed(false)
        .setTitle("Oops...")
        .setDescription(
          `⏳ You're on cooldown! Please wait \`${ms(remaining as number, {
            long: true,
          })}\``
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (error.identifier === "preconditionGuildOnly") {
      const embed: JoewyEmbed = new JoewyEmbed(false)
        .setTitle("Oops...")
        .setDescription(
          `🔨 The \`${context.commandName}\` command can only be used in a server.`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (error.identifier === "preconditionUserPermissions") {
      const { missing } = error.context as any;

      const embed: JoewyEmbed = new JoewyEmbed(false)
        .setTitle("Oops...")
        .setDescription(
          `⚠ You're missing the following permissions: ${missingPerms(
            interaction.member as GuildMember,
            missing
          )}`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (error.identifier === "preconditionClientPermissions") {
      const { missing } = error.context as any;

      const embed: JoewyEmbed = new JoewyEmbed(false)
        .setTitle("Oops...")
        .setDescription(
          `⚠ I'm missing the following permissions: ${missingPerms(
            interaction.guild?.me as GuildMember,
            missing
          )}`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
