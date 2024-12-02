import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  MessageComponentInteraction,
  PermissionFlagsBits,
} from "discord.js";
import getGuild from "../../lib/helpers/getGuild";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "settings",
  description: "change the settings of the bot for the current server",
  requiredUserPermissions: ["ManageGuild"],
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class SettingsCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">,
  ) {
    const guildInDB = await getGuild(interaction.guildId);

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
      funButton,
    );

    const exitButton = new ButtonBuilder()
      .setCustomId("exit")
      .setLabel("Exit")
      .setEmoji("⬅")
      .setStyle(ButtonStyle.Secondary);

    const exitRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      exitButton,
    );

    const { logging, fun, starboard } = guildInDB;

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
                `**Logging:** ${logging!.enabled ? "✅" : "❌"}`,
                `**Starboard:** ${starboard!.enabled ? "✅" : "❌"}`,
                `**Fun:** ${fun!.enabled ? "✅" : "❌"}`,
              ].join("\n"),
            },
          ]),
      ],
      components: [mainRow, exitRow],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 300000, // 5 min,
    });

    collector.on(
      "collect",
      async (componentInteraction: MessageComponentInteraction<"cached">) => {
        collector.resetTimer();

        const { logging, fun, starboard } = await getGuild(interaction.guildId);

        const goBackButton = new ButtonBuilder()
          .setCustomId("goBack")
          .setLabel("Home")
          .setEmoji("⬅")
          .setStyle(ButtonStyle.Secondary);

        const goBackRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          goBackButton,
        );

        const id = componentInteraction.customId;

        if (componentInteraction.isButton()) {
          if (id.startsWith("stars")) {
            if (id.endsWith("Left")) {
              await this.container.prisma.guild.update({
                where: {
                  id: interaction.guildId!,
                },
                data: {
                  starboard: {
                    update: {
                      starsRequired: {
                        decrement: 1,
                      },
                    },
                  },
                },
              });
            }

            if (id.endsWith("Right")) {
              await this.container.prisma.guild.update({
                where: {
                  id: interaction.guildId!,
                },
                data: {
                  starboard: {
                    update: {
                      starsRequired: {
                        increment: 1,
                      },
                    },
                  },
                },
              });
            }

            const { starboard } = await getGuild(interaction.guildId);

            const leftButton = new ButtonBuilder()
              .setEmoji("⬅")
              .setStyle(ButtonStyle.Secondary)
              .setCustomId("starsLeft");

            const rightButton = new ButtonBuilder()
              .setEmoji("➡")
              .setStyle(ButtonStyle.Secondary)
              .setCustomId("starsRight");

            await componentInteraction.update({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: "Configuring the stars required",
                    iconURL: interaction.guild.iconURL() || "",
                  })
                  .addFields([
                    {
                      name: "Use the arrows below to increase or decrease the amount of stars needed to be posted in the starboard",
                      value: `**Current:** ${starboard!.starsRequired}`,
                    },
                  ])
                  .setColor("Yellow"),
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  leftButton,
                  rightButton,
                ),
                goBackRow,
              ],
            });
          }

          if (id === "starboardChannel") {
            const channelSelector = new ChannelSelectMenuBuilder()
              .addChannelTypes(ChannelType.GuildText)
              .setCustomId("starboardChannelSelect");

            const disableButton = new ButtonBuilder()
              .setLabel("Disable")
              .setStyle(ButtonStyle.Danger)
              .setCustomId(`starboardChannelDisable`);

            const goBackAndDisableRow =
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                goBackButton,
                disableButton,
              );

            const channel = starboard!.channelId;

            await componentInteraction.update({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: "Configuring the starboard channel",
                    iconURL: interaction.guild.iconURL() as string,
                  })
                  .setColor("Yellow")
                  .setDescription(
                    `Pick a channel below to set as the starboard channel for \`${
                      interaction.guild!.name
                    }\`${channel ? "\nDisable it by selecting `Disable`" : ""}`,
                  ),
              ],
              components: [
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                  channelSelector,
                ),
                channel ? goBackAndDisableRow : goBackRow,
              ],
            });
          }

          if (id === "logging" || id === "starboard" || id === "fun") {
            const { logging, starboard } = await getGuild(interaction.guildId);

            const toggleButton = new ButtonBuilder()
              .setCustomId(
                `${id}${guildInDB[id]!.enabled ? "Disable" : "Enable"}`,
              )
              .setLabel(guildInDB[id]!.enabled ? "Disable" : "Enable")
              .setStyle(
                guildInDB[id]!.enabled
                  ? ButtonStyle.Danger
                  : ButtonStyle.Success,
              );

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
                          `**Modlog:** ${
                            logging!.modlogId
                              ? `<#${logging!.modlogId}>`
                              : "Disabled"
                          }`,
                          `**Auditlog:** ${
                            logging!.auditlogId
                              ? `<#${logging!.auditlogId}>`
                              : "Disabled"
                          }`,
                          `**Welcome:** ${
                            logging!.welcomeId
                              ? `<#${logging!.welcomeId}>`
                              : "Disabled"
                          }`,
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
                    toggleButton,
                  ),
                  goBackRow,
                ],
              });
            }

            if (id === "starboard") {
              const starsButton = new ButtonBuilder()
                .setLabel("Stars")
                .setCustomId("starsChange")
                .setEmoji("⭐")
                .setStyle(ButtonStyle.Primary);

              const channelSelectButton = new ButtonBuilder()
                .setLabel("Channel")
                .setCustomId("starboardChannel")
                .setStyle(ButtonStyle.Primary);

              await componentInteraction.update({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: "Configuring the starboard system",
                      iconURL: interaction.guild.iconURL() as string,
                    })
                    .addFields([
                      {
                        name: `Use the buttons below to edit the settings for ${bold(
                          `${interaction.guild.name}'s`,
                        )} starboard!`,
                        value: [
                          `**Stars Required:** ${bold(
                            starboard?.starsRequired?.toString()!,
                          )} ${
                            starboard?.starsRequired === 5 ? "(Default)" : ""
                          }`,
                          `**Channel:** ${
                            starboard?.channelId
                              ? `<#${starboard.channelId}>`
                              : "Not set"
                          }`,
                        ].join("\n"),
                      },
                    ])
                    .setColor("Yellow"),
                ],
                components: [
                  new ActionRowBuilder<ButtonBuilder>().addComponents(
                    starsButton,
                    channelSelectButton,
                    toggleButton,
                  ),
                  goBackRow,
                ],
              });
            }
          }

          if (id === "modlog" || id === "auditlog" || id === "welcome") {
            const channelSelector = new ChannelSelectMenuBuilder()
              .addChannelTypes(ChannelType.GuildText)
              .setCustomId(`${id}ChannelSelect`);

            const disableButton = new ButtonBuilder()
              .setLabel("Disable")
              .setStyle(ButtonStyle.Danger)
              .setCustomId(`${id}Disable`);

            const channelRow =
              new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                channelSelector,
              );

            const goBackAndDisableRow =
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                goBackButton,
                disableButton,
              );

            const name = `${id}Id` as "modlogId" | "auditlogId" | "welcomeId";

            const channel = logging![name];

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
                    }\`${channel ? "\nDisable it by selecting `Disable`" : ""}`,
                  ),
              ],
              components: [
                channelRow,
                channel ? goBackAndDisableRow : goBackRow,
              ],
            });
          }

          if (id === "goBack") {
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
                        `**Logging:** ${logging!.enabled ? "✅" : "❌"}`,
                        `**Starboard:** ${starboard!.enabled ? "✅" : "❌"}`,
                        `**Fun:** ${fun!.enabled ? "✅" : "❌"}`,
                      ].join("\n"),
                    },
                  ]),
              ],
              components: [mainRow, exitRow],
            });
          }

          if (id.endsWith("Enable")) {
            const name = id.split("Enable")[0];

            await this.container.prisma.guild.update({
              where: {
                id: interaction.guildId!,
              },
              data: {
                [name]: {
                  update: {
                    enabled: true,
                  },
                },
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
                    `Successfully ${bold("enabled")} the ${name} system for \`${
                      interaction.guild!.name
                    }\``,
                  ),
              ],
              components: [goBackRow],
            });
          }

          if (id.endsWith("Disable")) {
            let name = id.split("Disable")[0];
            let data = null;

            if (name === "starboardChannel") {
              name = "starboardId";
              data = {
                starboard: {
                  update: {
                    channelId: null,
                  },
                },
              };
            }

            if (name === "modlog" || name == "auditlog" || name === "welcome") {
              name += "Id";
              data = {
                logging: {
                  update: {
                    [name]: null,
                  },
                },
              };
            }

            if (data) {
              await this.container.prisma.guild.update({
                where: {
                  id: interaction.guildId!,
                },
                data,
              });
            } else {
              await this.container.prisma.guild.update({
                where: {
                  id: interaction.guildId!,
                },
                data: {
                  [name]: {
                    update: {
                      enabled: false,
                    },
                  },
                },
              });
            }

            await componentInteraction.update({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Success`,
                    iconURL: interaction.guild.iconURL() as string,
                  })
                  .setColor("Blue")
                  .setDescription(
                    `Successfully ${bold("disabled")} the ${
                      name.endsWith("Id") ? name.split("Id")[0] : name
                    } ${name.endsWith("Id") ? "channel" : "system"} for \`${
                      interaction.guild!.name
                    }\``,
                  ),
              ],
              components: [goBackRow],
            });
          }

          if (id === "exit") {
            collector.stop();
          }
        }

        if (componentInteraction.isChannelSelectMenu()) {
          const channelId = componentInteraction.values[0];

          if (id === "starboardChannelSelect") {
            if (starboard!.channelId === channelId) {
              await componentInteraction.update({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: `Error while editing ${interaction.guild!.name}`,
                      iconURL: interaction.guild.iconURL() as string,
                    })
                    .setColor("Blue")
                    .setDescription(
                      `<#${channelId}> is already set as the starboard channel!`,
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
                starboard: {
                  update: {
                    channelId,
                  },
                },
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
                    `Successfully set the starboard channel to <#${channelId}>`,
                  ),
              ],
              components: [goBackRow],
            });
            return;
          }

          const name = id.split("ChannelSelect")[0];

          const customId = `${name}Id` as
            | "modlogId"
            | "auditlogId"
            | "welcomeId";

          if (logging![customId] === channelId) {
            await componentInteraction.update({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Error while editing ${interaction.guild!.name}`,
                    iconURL: interaction.guild.iconURL() as string,
                  })
                  .setColor("Blue")
                  .setDescription(
                    `<#${channelId}> is already set as the ${name} channel!`,
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
              logging: {
                update: {
                  [customId]: channelId,
                },
              },
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
                  `Successfully set the ${name} channel to <#${channelId}>`,
                ),
            ],
            components: [goBackRow],
          });
        }
      },
    );

    collector.on("dispose", async (componentInteraction) => {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: "Exited",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `Run the \`/settings\` command again to change the settings for \`${
            interaction.guild!.name
          }\``,
        )
        .setColor("Blue");

      await componentInteraction.update({ embeds: [embed], components: [] });
    });
  }
}
