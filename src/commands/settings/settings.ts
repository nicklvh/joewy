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
  description: 'change the settings of the bot for the current server',
  requiredUserPermissions: ['ManageGuild'],
  requiredClientPermissions: ['ManageGuild'],
  runIn: 'GUILD_ANY',
})
export class SettingsCommand extends Command {
  private guildId = '';

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
            `Choose one of the options to below change the settings for that option`,
          )
          .addFields([
            {
              name: 'Modlog',
              value: modlogChannel!,
              inline: true,
            },
            {
              name: 'Auditlog',
              value: auditlogChannel!,
              inline: true,
            },
            {
              name: 'Welcome',
              value: welcomeChannel!,
              inline: true,
            },
          ]),
      ],
      components: [mainRow],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: Time.Minute * 5,
    });

    collector.on('collect', async (componentInteraction) => {
      collector.resetTimer();

      const goBackButton = new ButtonBuilder()
        .setCustomId('goBack')
        .setLabel('Go Back')
        .setStyle(ButtonStyle.Primary);

      const goBackRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        goBackButton,
      );

      const { modlogChannel, auditlogChannel, welcomeChannel } =
        await this.getChannels(true, false);

      const id = componentInteraction.customId;

      if (componentInteraction.isStringSelectMenu()) {
        const selection = componentInteraction.values[0];

        const channelSelector = new ChannelSelectMenuBuilder()
          .addChannelTypes(ChannelType.GuildText)
          .setCustomId(`${selection}ChannelSelect`);

        const disableButton = new ButtonBuilder()
          .setLabel('Disable')
          .setStyle(ButtonStyle.Danger)
          .setCustomId(`${selection}Disable`);

        const channelRow =
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            channelSelector,
          );

        const goBackAndDisableRow =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            goBackButton,
            disableButton,
          );

        let channel;
        let string;

        if (selection === 'modlog') {
          channel = modlogChannel;
          string = 'modlog';
        } else if (selection === 'auditlog') {
          channel = auditlogChannel;
          string = 'auditlog';
        } else if (selection === 'welcome') {
          channel = welcomeChannel;
          string = 'welcome';
        }

        await componentInteraction.update({
          embeds: [
            embed.setDescription(
              `Choose a channel below to configure the ${string} channel for \`${
                interaction.guild!.name
              }\`${channel ? '\n\nDisable it by selecting `Disable`' : ''}`,
            ),
          ],
          components: [channelRow, channel ? goBackAndDisableRow : goBackRow],
        });
      } else if (componentInteraction.isChannelSelectMenu()) {
        const channelId = componentInteraction.values[0];

        const channels = await this.getChannels(false, true);

        let data: object | undefined = undefined;
        let string = '';

        if (id === 'modlogChannelSelect') {
          if (channels.modlogChannel === channelId) {
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

          string = 'modlog';
          data = { modlogId: channelId };
        } else if (id === 'auditlogChannelSelect') {
          if (channels.auditlogChannel === channelId) {
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

          data = { auditlogId: channelId };
          string = 'auditlog';
        } else if (id === 'welcomeChannelSelect') {
          if (channels.welcomeChannel === channelId) {
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

          data = { welcomeId: channelId };
          string = 'welcome';
        }

        if (data) {
          await this.container.prisma.guild.update({
            where: {
              id: interaction.guildId!,
            },
            data,
          });

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Successfully set the ${string} channel to <#${channelId}>`,
              ),
            ],
            components: [goBackRow],
          });
        }
      } else if (componentInteraction.isButton()) {
        if (id === 'goBack') {
          const channels = await this.getChannels(false);

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
                  `Choose one of the options to below change the settings for that option`,
                )
                .addFields([
                  {
                    name: 'Modlog',
                    value: channels.modlogChannel!,
                    inline: true,
                  },
                  {
                    name: 'Auditlog',
                    value: channels.auditlogChannel!,
                    inline: true,
                  },
                  {
                    name: 'Welcome',
                    value: channels.welcomeChannel!,
                    inline: true,
                  },
                ]),
            ],
            components: [mainRow],
          });
          return;
        }

        let data: object | undefined = undefined;
        let string = '';

        if (id === 'modlogDisable') {
          data = { modlogId: null };
          string = 'modlog';
        } else if (id === 'auditlogDisable') {
          data = { auditlogId: null };
          string = 'auditlog';
        } else if (id === 'welcomeDisable') {
          data = { welcomeId: null };
          string = 'welcome';
        }

        if (data) {
          await this.container.prisma.guild.update({
            where: {
              id: interaction.guildId!,
            },
            data,
          });

          await componentInteraction.update({
            embeds: [
              embed.setDescription(
                `Successfully disabled the ${string} channel for \`${
                  interaction.guild!.name
                }\``,
              ),
            ],
            components: [goBackRow],
          });
        }
      }
    });

    collector.on('dispose', async () => {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: 'Timed out',
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `Run the \`/settings\` command again to change the settings for \`${
            interaction.guild!.name
          }\``,
        )
        .setTimestamp()
        .setColor('Blue');

      await interaction.editReply({ embeds: [embed] });
    });
  }

  private async getChannels(shouldReturnOrNull: boolean, returnId?: boolean) {
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

    if (returnId) {
      modlogChannel = guildInDB.modlogId ?? null;
      auditlogChannel = guildInDB.auditlogId ?? null;
      welcomeChannel = guildInDB.welcomeId ?? null;
    }

    return {
      modlogChannel,
      auditlogChannel,
      welcomeChannel,
    };
  }
}
