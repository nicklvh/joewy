import { Command } from "@sapphire/framework";
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
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

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: "BUTTON",
      max: 1,
      time: 60000,
    });

    collector?.on("collect", async (collected) => {
      if (collected.user.id === interaction.user.id) {
        if (collected.customId === "editmod") {
          const embed = new JoewyEmbed(true)
            .setAuthor({
              name: "Modlog",
              iconURL: interaction.guild!.iconURL()!,
            })
            .setDescription(`Select a new modlog channel.`);

          const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("modlogchoose")
              .setMinValues(1)
              .setMaxValues(1)
              .addOptions(
                interaction
                  .guild!.channels.cache.filter((c) => c.type === "GUILD_TEXT")
                  .map((c) => {
                    return {
                      label: c.name,
                      value: c.id,
                    };
                  })
              )
          );

          await interaction.editReply({
            embeds: [embed],
            components: [row],
          });

          collector.stop();
        } else if (collected.customId === "editaudit") {
          const embed = new JoewyEmbed(true)
            .setAuthor({
              name: "Auditlog",
              iconURL: interaction.guild!.iconURL()!,
            })
            .setDescription(`Select a new auditlog channel.`);

          const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("auditlogchoose")
              .setMinValues(1)
              .setMaxValues(1)
              .addOptions(
                interaction
                  .guild!.channels.cache.filter((c) => c.type === "GUILD_TEXT")
                  .map((c) => {
                    return {
                      label: c.name,
                      value: c.id,
                    };
                  })
              )
          );

          await interaction.editReply({
            embeds: [embed],
            components: [row],
          });

          collector.stop();
        }
      } else {
        return interaction.reply({
          content: "These buttons arent for you.",
          ephemeral: true,
        });
      }

      const collector2 = interaction.channel?.createMessageComponentCollector({
        max: 1,
        componentType: "SELECT_MENU",
        filter: (c) => c.user.id === interaction.user.id,
      });

      collector2?.on("collect", async (collected) => {
        if (interaction.user.id === collected.user.id) {
          if (collected.customId === "modlogchoose") {
            const embed = new JoewyEmbed(true)
              .setAuthor({
                name: "I have set a new channel!",
                iconURL: interaction.guild!.iconURL()!,
              })
              .setDescription(
                `You have set the modlog channel to: <#${collected.values[0]}>`
              );

            await this.container.database.guild.update({
              where: {
                id: guild!.id,
              },
              data: { modlog: collected.values[0] },
            });

            await interaction.editReply({ embeds: [embed] });

            collector2.stop();
          } else if (collected.customId === "auditlogchoose") {
            const embed = new JoewyEmbed(true)
              .setAuthor({
                name: "I have set a new channel!",
                iconURL: interaction.guild!.iconURL()!,
              })
              .setDescription(
                `You have set the auditlog channel to: <#${collected.values[0]}>`
              );

            console.log(collected.values);

            await this.container.database.guild.update({
              where: {
                id: guild!.id,
              },
              data: { auditlog: collected.values[0] },
            });

            await interaction.editReply({ embeds: [embed] });

            collector2.stop();
          }
        } else {
          return interaction.reply({
            content: "These buttons arent for you.",
            ephemeral: true,
          });
        }
      });
    });
  }
}
