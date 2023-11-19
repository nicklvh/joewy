import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'settings',
  description: 'change the settings of the bot for the current server ⚙️',
  requiredUserPermissions: ['ManageGuild'],
  requiredClientPermissions: ['ManageGuild'],
  runIn: 'GUILD_ANY',
})
export class SettingsCommand extends Command {
  private guildId: string = '';

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
      { idHints: ['1170836355543212052'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    this.guildId = interaction.guildId!;

    const { modlogChannel, auditlogChannel, welcomeChannel } =
      await this.getChannels(false);

    const select = new StringSelectMenuBuilder()
      .setCustomId('options')
      .setPlaceholder('Select an option')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Modlog Channel')
          .setDescription('Change or disable the modlog')
          .setValue('modlog'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Auditlog Channel')
          .setDescription('Change or disable the auditlog')
          .setValue('auditlog'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Welcome Channel')
          .setDescription('Change or disable the welcome channel')
          .setValue('welcome'),
      );

    const mainRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Settings for ${interaction.guild!.name}`,
        iconURL: interaction.guild?.iconURL() ?? undefined,
      })
      .setTimestamp()
      .setColor('Blue');

    const message = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Settings for ${interaction.guild!.name}`,
            iconURL: interaction.guild?.iconURL() ?? undefined,
          })
          .setTimestamp()
          .setColor('Blue')
          .setDescription(
            `Choose one of the options below change the settings for that option`,
          )
          .addFields([
            {
              name: 'Modlog',
              value: modlogChannel,
              inline: true,
            },
            {
              name: 'Auditlog',
              value: auditlogChannel,
              inline: true,
            },
            {
              name: 'Welcome',
              value: welcomeChannel,
              inline: true,
            },
          ]),
      ],
      components: [mainRow],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: Time.Minute * 3,
    });

    collector.on('collect', async (componentInteraction) => {
      const goBackButton = new ButtonBuilder()
        .setCustomId('goBack')
        .setLabel('Go Back')
        .setStyle(ButtonStyle.Primary);

      const goBackRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        goBackButton,
      );

      const { modlogChannel, auditlogChannel, welcomeChannel } =
        await this.getChannels(true);

      if (componentInteraction.isStringSelectMenu()) {
        const selection = componentInteraction.values[0];

        const channelSelector = new ChannelSelectMenuBuilder().addChannelTypes(
          ChannelType.GuildText,
        );

        const disableButton = new ButtonBuilder()
          .setLabel('Disable')
          .setStyle(ButtonStyle.Danger);

        if (selection === 'modlog') {
          const channelRow =
            new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
              channelSelector.setCustomId('modlogChannelSelect'),
            );

          const goBackAndDisableRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              goBackButton,
              disableButton.setCustomId('modlogDisable'),
            );

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Choose a channel below to configure the auditlog channel for \`${
                  interaction.guild!.name
                }\`${
                  modlogChannel ? '\n\nDisable it by selecting `Disable`' : ''
                }`,
              ),
            ],
            components: [
              channelRow,
              modlogChannel ? goBackAndDisableRow : goBackRow,
            ],
          });
        } else if (selection === 'auditlog') {
          const channelRow =
            new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
              channelSelector.setCustomId('auditlogChannelSelect'),
            );

          const goBackAndDisableRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              goBackButton,
              disableButton.setCustomId('auditlogDisable'),
            );

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Choose a channel below to configure the auditlog channel for \`${
                  interaction.guild!.name
                }\`${
                  auditlogChannel ? '\n\nDisable it by selecting `Disable`' : ''
                }`,
              ),
            ],
            components: [
              channelRow,
              auditlogChannel ? goBackAndDisableRow : goBackRow,
            ],
          });
        } else if (selection === 'welcome') {
          const channelRow =
            new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
              channelSelector.setCustomId('welcomeChannelSelect'),
            );

          const goBackAndDisableRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              goBackButton,
              disableButton.setCustomId('welcomeDisable'),
            );

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Choose a channel below to configure the auditlog channel for \`${
                  interaction.guild!.name
                }\`${
                  welcomeChannel ? '\n\nDisable it by selecting `Disable`' : ''
                }`,
              ),
            ],
            components: [channelRow, goBackAndDisableRow],
          });
        }
      } else if (componentInteraction.isChannelSelectMenu()) {
        const channelId = componentInteraction.values[0];

        const guildInDB = await this.container.prisma.guild.findUnique({
          where: {
            id: interaction.guildId!,
          },
        });

        if (componentInteraction.customId === 'modlogChannelSelect') {
          if (guildInDB?.modlogId === channelId) {
            await componentInteraction.update({
              embeds: [
                embed.setDescription(
                  `<#${channelId}> is already set as the modlog channel!`,
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
              modlogId: channelId,
            },
          });

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Successfully set the modlog channel to <#${channelId}>`,
              ),
            ],
            components: [goBackRow],
          });
        } else if (componentInteraction.customId === 'auditlogChannelSelect') {
          if (guildInDB?.auditlogId === channelId) {
            await componentInteraction.update({
              embeds: [
                embed.setDescription(
                  `<#${channelId}> is already set as the auditlog channel!`,
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
              auditlogId: channelId,
            },
          });

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Successfully set the auditlog channel to <#${channelId}>`,
              ),
            ],
            components: [goBackRow],
          });
        } else if (componentInteraction.customId === 'welcomeChannelSelect') {
          if (guildInDB?.welcomeId === channelId) {
            await componentInteraction.update({
              embeds: [
                embed.setDescription(
                  `<#${channelId}> is already set as the welcome channel!`,
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
              welcomeId: channelId,
            },
          });

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Successfully set the welcome channel to <#${channelId}>`,
              ),
            ],
            components: [goBackRow],
          });
        }
      } else if (componentInteraction.isButton()) {
        if (componentInteraction.customId === 'goBack') {
          const {
            modlogChannel,
            auditlogChannel,
            welcomeChannel,
          }: {
            modlogChannel: string;
            auditlogChannel: string;
            welcomeChannel: string;
          } = await this.getChannels(false);

          await componentInteraction.update({
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: `Settings for ${interaction.guild!.name}`,
                  iconURL: interaction.guild?.iconURL() ?? undefined,
                })
                .setTimestamp()
                .setColor('Blue')
                .setDescription(
                  `Choose one of the options below change the settings for that option`,
                )
                .addFields([
                  {
                    name: 'Modlog',
                    value: modlogChannel,
                    inline: true,
                  },
                  {
                    name: 'Auditlog',
                    value: auditlogChannel,
                    inline: true,
                  },
                  {
                    name: 'Welcome',
                    value: welcomeChannel,
                    inline: true,
                  },
                ]),
            ],
            components: [mainRow],
          });
        } else if (componentInteraction.customId === 'modlogDisable') {
          await this.container.prisma.guild.update({
            where: {
              id: interaction.guildId!,
            },
            data: {
              modlogId: null,
            },
          });

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Successfully disabled the modlog for \`${
                  interaction.guild!.name
                }\``,
              ),
            ],
            components: [goBackRow],
          });
        } else if (componentInteraction.customId === 'auditlogDisable') {
          await this.container.prisma.guild.update({
            where: {
              id: interaction.guildId!,
            },
            data: {
              auditlogId: null,
            },
          });

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Successfully disabled the auditlog for \`${
                  interaction.guild!.name
                }\``,
              ),
            ],
            components: [goBackRow],
          });
        } else if (componentInteraction.customId === 'welcomeDisable') {
          await this.container.prisma.guild.update({
            where: {
              id: interaction.guildId!,
            },
            data: {
              welcomeId: null,
            },
          });

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Successfully disabled the welcome channel for \`${
                  interaction.guild!.name
                }\``,
              ),
            ],
            components: [goBackRow],
          });
        }
      }
    });
  }

  private async getChannels(shouldReturnOrNull: boolean): Promise<any> {
    let guildInDB = await this.container.prisma.guild.findUnique({
      where: { id: this.guildId },
    });

    if (!guildInDB)
      guildInDB = await this.container.prisma.guild.create({
        data: { id: this.guildId! },
      });

    let modlogChannel;
    let auditlogChannel;
    let welcomeChannel;

    if (shouldReturnOrNull) {
      modlogChannel = guildInDB.modlogId ? `<#${guildInDB.modlogId}>` : null;
      auditlogChannel = guildInDB.auditlogId
        ? `<#${guildInDB.auditlogId}>`
        : null;
      welcomeChannel = guildInDB.welcomeId ? `<#${guildInDB.welcomeId}>` : null;
    } else {
      modlogChannel = guildInDB.modlogId
        ? `<#${guildInDB.modlogId}>`
        : 'Not set';
      auditlogChannel = guildInDB.auditlogId
        ? `<#${guildInDB.auditlogId}>`
        : 'Not set';
      welcomeChannel = guildInDB.welcomeId
        ? `<#${guildInDB.welcomeId}>`
        : 'Not set';
    }

    return {
      modlogChannel,
      auditlogChannel,
      welcomeChannel,
    };
  }
}
