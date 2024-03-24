import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
  ChannelType,
  EmbedBuilder,
  MessageComponentInteraction,
  PermissionFlagsBits,
} from "discord.js";
import type { Guild } from "@prisma/client";
import { Time } from "@sapphire/time-utilities";

@ApplyOptions<Command.Options>({
  name: "settings",
  description: "change the settings of the bot for the current server",
  requiredUserPermissions: ["ManageGuild"],
  requiredClientPermissions: ["ManageGuild"],
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class SettingsCommand extends Command {
  private guildId = "";

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    this.guildId = interaction.guildId!;

    const guildInDB: Guild = await this.getGuild();

    const loggingButton = new ButtonBuilder()
      .setLabel("Logging")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📝")
      .setCustomId("logging");

    const starboardButton = new ButtonBuilder()
      .setLabel("Starboard")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("⭐")
      .setCustomId("starboard");

    const funButton = new ButtonBuilder()
      .setLabel("Fun")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎉")
      .setCustomId("fun");

    const mainRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      loggingButton,
      starboardButton,
      funButton
    );

    const exitButton = new ButtonBuilder()
      .setCustomId("exit")
      .setLabel("Exit")
      .setEmoji("⬅")
      .setStyle(ButtonStyle.Secondary);

    const exitRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      exitButton
    );

    const message = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Configure ${interaction.guild!.name}`,
            iconURL: interaction.guild.iconURL() as string,
          })
          .setColor("Blue")
          .addFields([
            {
              name: "Use the buttons below to configure the server.",
              value: [
                `**Logging:** ${guildInDB?.logging ? "✅" : "❌"}`,
                `**Starboard:** ${guildInDB?.starboard ? "✅" : "❌"}`,
                `**Fun:** ${guildInDB?.fun ? "✅" : "❌"}`,
              ].join("\n"),
            },
          ]),
      ],
      components: [mainRow, exitRow],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: Time.Minute * 5,
    });

    collector.on(
      "collect",
      async (componentInteraction: MessageComponentInteraction<"cached">) => {
        collector.resetTimer();

        const goBackButton = new ButtonBuilder()
          .setCustomId("goBack")
          .setLabel("Home")
          .setEmoji("⬅")
          .setStyle(ButtonStyle.Secondary);

        const goBackRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          goBackButton
        );

        const guild: Guild = await this.getGuild();

        const id = componentInteraction.customId;

        if (componentInteraction.isButton()) {
          if (id === "logging" || "starboard" || "fun") {
            const dbOption = guild[id as "logging" | "starboard" | "fun"];

            const toggleButton = new ButtonBuilder()
              .setCustomId(`${id}${dbOption ? "Disable" : "Enable"}`)
              .setLabel(dbOption ? "Disable" : "Enable")
              .setStyle(dbOption ? ButtonStyle.Danger : ButtonStyle.Success);

            if (id === "logging") {
              await componentInteraction.update({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: "Configuring the logging system",
                      iconURL: interaction.guild.iconURL() as string,
                    })
                    .addFields([
                      {
                        name: `Use the buttons below to edit the respective channel and settings`,
                        value: [
                          `**Modlog:** ${guild.modlogId ? `<#${guild.modlogId}>` : "Not set"}`,
                          `**Auditlog:** ${guild.auditlogId ? `<#${guild.auditlogId}>` : "Not set"}`,
                          `**Welcome:** ${guild.welcomeId ? `<#${guild.welcomeId}>` : "Not set"}`,
                        ].join("\n"),
                      },
                    ])
                    .setColor("Blue"),
                ],
                components: [
                  new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                      .setCustomId("modlog")
                      .setLabel("Modlog")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("auditlog")
                      .setLabel("Auditlog")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("welcome")
                      .setLabel("Welcome")
                      .setStyle(ButtonStyle.Primary),
                    toggleButton
                  ),
                  goBackRow,
                ],
              });
            }

            if (id === "modlog" || id === "auditlog" || id === "welcome") {
              const channelSelector = new ChannelSelectMenuBuilder()
                .addChannelTypes(ChannelType.GuildText)
                .setCustomId(`${id}ChannelSelect`);

              const disableButton = new ButtonBuilder()
                .setLabel("Disable")
                .setStyle(ButtonStyle.Danger)
                .setCustomId(`${id}DisableMod`);

              const channelRow =
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                  channelSelector
                );

              const goBackAndDisableRow =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  goBackButton,
                  disableButton
                );

              const name = `${id}Id` as "modlogId" | "auditlogId" | "welcomeId";

              const channel = guild[name];

              await componentInteraction.update({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: `Configuring the ${id} channel`,
                      iconURL: interaction.guild.iconURL() as string,
                    })
                    .setColor("Blue")
                    .setDescription(
                      `Pick a channel below to edit the ${id} channel for \`${
                        interaction.guild!.name
                      }\`${channel ? "\nDisable it by selecting `Disable`" : ""}`
                    ),
                ],
                components: [
                  channelRow,
                  channel ? goBackAndDisableRow : goBackRow,
                ],
              });
            }

            if (id === "goBack") {
              const guildInDB: Guild = await this.getGuild();

              await componentInteraction.update({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: `Configure ${interaction.guild!.name}`,
                      iconURL: interaction.guild.iconURL() ?? undefined,
                    })
                    .setColor("Blue")
                    .addFields([
                      {
                        name: "Use the buttons below to configure the server.",
                        value: [
                          `**Logging:** ${guildInDB?.logging ? "✅" : "❌"}`,
                          `**Starboard:** ${guildInDB?.starboard ? "✅" : "❌"}`,
                          `**Fun:** ${guildInDB?.fun ? "✅" : "❌"}`,
                        ].join("\n"),
                      },
                    ]),
                ],
                components: [mainRow, exitRow],
              });
            }

            if (id.endsWith("DisableMod")) {
              const name = id.split("DisableMod")[0];

              const customId = `${name}Id`;

              await this.container.prisma.guild.update({
                where: {
                  id: interaction.guildId!,
                },
                data: {
                  [customId]: null,
                },
              });

              await componentInteraction.update({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: `Success`,
                      iconURL: interaction.guild.iconURL() as string,
                    })
                    .setColor("Blue")
                    .setDescription(
                      `Successfully disabled the ${name} channel for \`${interaction.guild!.name}\``
                    ),
                ],
                components: [goBackRow],
              });
            }

            if (id.endsWith("Enable")) {
              const name = id.split("Enable")[0];

              await this.container.prisma.guild.update({
                where: {
                  id: interaction.guildId!,
                },
                data: {
                  [name]: true,
                },
              });

              await componentInteraction.update({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: `Success`,
                      iconURL: interaction.guild.iconURL() as string,
                    })
                    .setColor("Blue")
                    .setDescription(
                      `Successfully enabled the ${name} system for \`${interaction.guild!.name}\``
                    ),
                ],
                components: [goBackRow],
              });
            }

            if (id.endsWith("Disable")) {
              const name = id.split("Disable")[0];

              await this.container.prisma.guild.update({
                where: {
                  id: interaction.guildId!,
                },
                data: {
                  [name]: false,
                },
              });

              await componentInteraction.update({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: `Success`,
                      iconURL: interaction.guild.iconURL() as string,
                    })
                    .setColor("Blue")
                    .setDescription(
                      `Successfully disabled the ${name} system for \`${interaction.guild!.name}\``
                    ),
                ],
                components: [goBackRow],
              });
            }
          }

          if (componentInteraction.isChannelSelectMenu()) {
            componentInteraction =
              componentInteraction as ChannelSelectMenuInteraction<"cached">;

            const channelId = (
              componentInteraction as ChannelSelectMenuInteraction<"cached">
            ).values[0];

            const name = id.split("ChannelSelect")[0];

            const customId = `${name}Id` as
              | "modlogId"
              | "auditlogId"
              | "welcomeId";

            if (guild[customId] === channelId) {
              await componentInteraction.update({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: `Error while editing ${interaction.guild!.name}`,
                      iconURL: interaction.guild.iconURL() as string,
                    })
                    .setColor("Blue")
                    .setDescription(
                      `<#${channelId}> is already set as the ${name} channel!`
                    ),
                ],
                components: [goBackRow],
              });
              return;
            }

            await this.container.prisma.guild.update({
              where: {
                id: interaction.guildId!,
              },
              data: {
                [customId]: channelId,
              },
            });

            await componentInteraction.update({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Success`,
                    iconURL: interaction.guild.iconURL() as string,
                  })
                  .setColor("Blue")
                  .setDescription(
                    `Successfully set the ${name} channel to <#${channelId}>`
                  ),
              ],
              components: [goBackRow],
            });
          }
        }
      }
    );

    collector.on("dispose", async () => {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: "Exited",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `Run the \`/settings\` command again to change the settings for \`${interaction.guild!.name}\``
        )
        .setColor("Blue");

      await interaction.editReply({ embeds: [embed] });
    });
  }

  private async getGuild(): Promise<Guild> {
    let guild: Guild | null = await this.container.prisma.guild.findUnique({
      where: { id: this.guildId },
    });

    if (!guild)
      guild = await this.container.prisma.guild.create({
        data: { id: this.guildId },
      });

    return guild;
  }
}
