import { ApplicationCommandRegistry } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { Guild } from '../../../lib';
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export class SettingsCommand extends Subcommand {
  public constructor(context: Subcommand.Context, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: 'settings',
      description: 'change the settings of the bot for the current server',
      requiredUserPermissions: ['ManageGuild'],
      requiredClientPermissions: ['ManageGuild'],
      runIn: 'GUILD_ANY',
      subcommands: [
        { name: 'list', chatInputRun: 'chatInputList' },
        {
          name: 'set',
          type: 'group',
          entries: [
            { name: 'modlog', chatInputRun: 'chatInputSetModlog' },
            { name: 'auditlog', chatInputRun: 'chatInputSetAuditlog' },
            { name: 'welcome', chatInputRun: 'chatInputSetWelcome' },
          ],
        },
      ],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand((command) =>
            command
              .setName('list')
              .setDescription(
                'list the current settings of the bot for the current server',
              ),
          )
          .addSubcommandGroup((group) =>
            group
              .setName('set')
              .setDescription(
                'change the settings of the bot for the current server',
              )
              .addSubcommand((command) =>
                command
                  .setName('modlog')
                  .setDescription(
                    'change the modlog channel for the current server',
                  )
                  .addChannelOption((option) =>
                    option
                      .setName('channel')
                      .setDescription(
                        "the channel to set the modlog to, don't input a channel to disable",
                      )
                      .setRequired(false)
                      .addChannelTypes(ChannelType.GuildText),
                  ),
              )
              .addSubcommand((command) =>
                command
                  .setName('auditlog')
                  .setDescription(
                    'change the auditlog channel for the current server',
                  )
                  .addChannelOption((option) =>
                    option
                      .setName('channel')
                      .setDescription(
                        "the channel to set the auditlog to, don't input a channel to disable",
                      )
                      .setRequired(false)
                      .addChannelTypes(ChannelType.GuildText),
                  ),
              )
              .addSubcommand((command) =>
                command
                  .setName('welcome')
                  .setDescription(
                    'change the welcome channel for the current server',
                  )
                  .addChannelOption((option) =>
                    option
                      .setName('channel')
                      .setDescription(
                        "the channel to set the welcome to, don't input a channel to disable",
                      )
                      .setRequired(false)
                      .addChannelTypes(ChannelType.GuildText),
                  ),
              ),
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
      { idHints: ['1170836355543212052'] },
    );
  }

  public async chatInputList(
    interaction: Subcommand.ChatInputCommandInteraction,
  ) {
    this.container.logger.info('hihihi');

    let guildInDB = await Guild.findOne({ guildId: interaction.guildId });

    if (!guildInDB) {
      guildInDB = await Guild.create({ guildId: interaction.guildId });
      await guildInDB.save();
    }

    const modlogChannel = guildInDB.channelIds?.modlogId
      ? `<#${guildInDB.channelIds?.modlogId}>`
      : 'Not set';

    const auditlogChannel = guildInDB.channelIds?.auditlogId
      ? `<#${guildInDB.channelIds?.auditlogId}>`
      : 'Not set';

    const welcomeChannel = guildInDB.channelIds?.welcomeId
      ? `<#${guildInDB.channelIds?.welcomeId}>`
      : 'Not set';

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Settings for ${interaction.guild?.name}`,
            iconURL: interaction.guild?.iconURL() || undefined,
          })
          .addFields([
            {
              name: 'Modlog',
              value: modlogChannel,
            },
            {
              name: 'Auditlog',
              value: auditlogChannel,
            },
            {
              name: 'Welcome',
              value: welcomeChannel,
            },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
    });
  }

  public async chatInputSetModlog(
    interaction: Subcommand.ChatInputCommandInteraction,
  ) {
    const channel = interaction.options.getChannel('channel');

    let guildInDB = await Guild.findOne({ guildId: interaction.guildId });

    if (!guildInDB) {
      guildInDB = await Guild.create({ guildId: interaction.guildId });
      await guildInDB.save();
    }

    if (channel) {
      guildInDB.channelIds!.modlogId = channel.id;
    } else {
      guildInDB.channelIds!.modlogId = undefined;
    }

    await guildInDB.save();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Modlog channel ${
              channel ? `set to ${channel.name}` : 'disabled'
            }`,
            iconURL: interaction.guild?.iconURL() || undefined,
          })
          .setColor('Blue')
          .setTimestamp(),
      ],
    });
  }

  public async chatInputSetAuditlog(
    interaction: Subcommand.ChatInputCommandInteraction,
  ) {
    const channel = interaction.options.getChannel('channel');

    let guildInDB = await Guild.findOne({ guildId: interaction.guildId });

    if (!guildInDB) {
      guildInDB = await Guild.create({ guildId: interaction.guildId });
      await guildInDB.save();
    }

    if (channel) {
      guildInDB.channelIds!.auditlogId = channel.id;
    } else {
      guildInDB.channelIds!.auditlogId = undefined;
    }

    await guildInDB.save();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Auditlog channel ${
              channel ? `set to ${channel.name}` : 'disabled'
            }`,
            iconURL: interaction.guild?.iconURL() || undefined,
          })
          .setColor('Blue')
          .setTimestamp(),
      ],
    });
  }

  public async chatInputSetWelcome(
    interaction: Subcommand.ChatInputCommandInteraction,
  ) {
    const channel = interaction.options.getChannel('channel');

    let guildInDB = await Guild.findOne({ guildId: interaction.guildId });

    if (!guildInDB) {
      guildInDB = await Guild.create({ guildId: interaction.guildId });
      await guildInDB.save();
    }

    if (channel) {
      guildInDB.channelIds!.welcomeId = channel.id;
    } else {
      guildInDB.channelIds!.welcomeId = undefined;
    }

    await guildInDB.save();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Welcome channel ${
              channel ? `set to ${channel.name}` : 'disabled'
            }`,
            iconURL: interaction.guild?.iconURL() || undefined,
          })
          .setColor('Blue')
          .setTimestamp(),
      ],
    });
  }
}
