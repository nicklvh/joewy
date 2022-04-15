import { Command } from "@sapphire/framework";
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { JoewyEmbed } from "../../structures";

@ApplyOptions<Command.Options>({
  description: "Set settings for the server",
  requiredUserPermissions: ["MANAGE_GUILD"],
  fullCategory: ["moderation"],
  runIn: ["GUILD_ANY"],
  chatInputCommand: {
    register: true,
    idHints: ["964321442655256647"],
  },
})
export class SettingsCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    let guild = await this.container.database.guild.findUnique({
      where: { id: interaction.guild!.id },
    });

    if (!guild)
      guild = await this.container.database.guild.create({
        data: {
          id: interaction.guild!.id,
        },
      });

    const embed = new JoewyEmbed()
      .setAuthor({
        name: `Settings | ${interaction.guild!.name}`,
        iconURL: interaction.guild!.iconURL()!,
      })
      .setDescription(
        `**❯ Modlog:** ${
          guild.modlog ? `<#${guild.modlog}>` : `None`
        }\n**❯ Auditlog:** ${guild.auditlog ? `<#${guild.auditlog}>` : `None`}`
      )
      .setTimestamp();

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Edit Modlog")
        .setCustomId("editmod")
        .setStyle("PRIMARY")
        .setEmoji("📝"),
      new MessageButton()
        .setLabel("Edit Auditlog")
        .setCustomId("editaudit")
        .setStyle("PRIMARY")
        .setEmoji("📝")
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
