import { ApplicationCommandRegistry } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
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
    let guildInDB = await this.container.prisma.guild.findUnique({
      where: { id: interaction.guildId! },
    });

    if (!guildInDB) {
      guildInDB = await this.container.prisma.guild.create({
        data: { id: interaction.guildId! },
      });
    }

    const modlogChannel = guildInDB.modlogId
      ? `<#${guildInDB.modlogId}>`
      : 'Not set';

    const auditlogChannel = guildInDB.auditlogId
      ? `<#${guildInDB.auditlogId}>`
      : 'Not set';

    const welcomeChannel = guildInDB.welcomeId
      ? `<#${guildInDB.welcomeId}>`
      : 'Not set';

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Settings for ${interaction.guild?.name}`,
            // @ts-ignore - guild icon url is not undefined
            iconURL: interaction.guild?.iconURL()
              ? interaction.guild?.iconURL()
              : this.container.client.user?.displayAvatarURL(),
          })
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

    let guildInDB = await this.container.prisma.guild.findUnique({
      where: { id: interaction.guildId! },
    });

    if (!guildInDB) {
      guildInDB = await this.container.prisma.guild.create({
        data: { id: interaction.guildId! },
      });
    }

    if (channel) {
      await this.container.prisma.guild.update({
        where: { id: interaction.guildId! },
        data: { modlogId: channel.id },
      });
    } else {
      await this.container.prisma.guild.update({
        where: { id: interaction.guildId! },
        data: { modlogId: null },
      });
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Modlog channel set`,
            iconURL: interaction.guild?.iconURL() || undefined,
          })
          .addFields([
            {
              name: 'Channel',
              value: channel ? `<#${channel.id}>` : 'Not set',
            },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
    });
  }

  public async chatInputSetAuditlog(
    interaction: Subcommand.ChatInputCommandInteraction,
  ) {
    const channel = interaction.options.getChannel('channel');

    let guildInDB = await this.container.prisma.guild.findUnique({
      where: { id: interaction.guildId! },
    });

    if (!guildInDB) {
      guildInDB = await this.container.prisma.guild.create({
        data: { id: interaction.guildId! },
      });
    }

    if (channel) {
      await this.container.prisma.guild.update({
        where: { id: interaction.guildId! },
        data: { auditlogId: channel.id },
      });
    } else {
      await this.container.prisma.guild.update({
        where: { id: interaction.guildId! },
        data: { auditlogId: null },
      });
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Auditlog channel set`,
            iconURL: interaction.guild?.iconURL() || undefined,
          })
          .addFields([
            {
              name: 'Channel',
              value: channel ? `<#${channel.id}>` : 'Not set',
            },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
    });
  }

  public async chatInputSetWelcome(
    interaction: Subcommand.ChatInputCommandInteraction,
  ) {
    const channel = interaction.options.getChannel('channel');

    let guildInDB = await this.container.prisma.guild.create({
      data: { id: interaction.guildId! },
    });

    if (!guildInDB) {
      guildInDB = await this.container.prisma.guild.create({
        data: { id: interaction.guildId! },
      });
    }

    if (channel) {
      await this.container.prisma.guild.update({
        where: { id: interaction.guildId! },
        data: { auditlogId: channel.id },
      });
    } else {
      await this.container.prisma.guild.update({
        where: { id: interaction.guildId! },
        data: { auditlogId: null },
      });
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Welcome channel set`,
            iconURL: interaction.guild?.iconURL() || undefined,
          })
          .addFields([
            {
              name: 'Channel',
              value: channel ? `<#${channel.id}>` : 'Not set',
            },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
    });
  }
}
