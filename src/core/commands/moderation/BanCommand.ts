import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Time } from '@sapphire/time-utilities';
import { Modlog } from '../../../lib';
import { TypeEnum } from '../../../lib/utils';

export class BanCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'ban',
      description: 'ban a member 🔨',
      requiredUserPermissions: ['BanMembers'],
      requiredClientPermissions: ['BanMembers'],
      runIn: 'GUILD_ANY',
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand(
      (builder) => {
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('the user to ban')
              .setRequired(true),
          )
          .addStringOption((option) =>
            option
              .setName('reason')
              .setDescription('the reason for the ban')
              .setRequired(false),
          )
          .addStringOption((option) =>
            option
              .setName('evidence')
              .setDescription('Provide evidence for the ban')
              .setRequired(false),
          )
          .addIntegerOption((option) =>
            option
              .setName('days')
              .setDescription('the number of days of messages to delete')
              .setRequired(false)
              .setMinValue(0)
              .setMaxValue(7),
          )
          .addBooleanOption((option) =>
            option
              .setName('silent')
              .setDescription('whether to send the ban message silently')
              .setRequired(false),
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);
      },
      { idHints: ['1169766210443956264'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const user = interaction.options.getUser('user')!;
    const reason =
      interaction.options.getString('reason') ?? 'No reason provided';
    const evidence =
      interaction.options.getString('evidence') ?? 'No evidence provided';
    const days = interaction.options.getInteger('days') ?? 0;
    const silent = interaction.options.getBoolean('silent') ?? false;

    await Modlog.create({
      guildId: interaction.guildId,
      userId: user.id,
      evidence,
      type: TypeEnum.Ban,
      moderatorId: interaction.user.id,
      reason,
    });

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `You have been banned from ${interaction.guild!.name}`,
            iconURL: interaction.guild!.iconURL() || undefined,
          })
          .addFields([
            {
              name: 'Reason',
              value: `\`${
                reason.length > 100 ? `${reason.substring(0, 100)}...` : reason
              }\``,
            },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
    });

    await interaction.guild?.bans.create(user, {
      reason,
      deleteMessageSeconds: days * (Time.Day / 1000),
    });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Banned ${user.tag}`,
            iconURL: user.displayAvatarURL(),
          })
          .addFields([
            {
              name: 'Reason',
              value: `\`${
                reason.length > 100 ? `${reason.substring(0, 100)}...` : reason
              }\``,
            },
            {
              name: 'Messages deleted',
              value: `\`${days}\` days of messages deleted`,
            },
            {
              name: 'Evidence',
              value: `\`${
                evidence.length > 100
                  ? `${evidence.substring(0, 100)}...`
                  : evidence
              }\``,
            },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
      ephemeral: silent,
    });
  }
}
