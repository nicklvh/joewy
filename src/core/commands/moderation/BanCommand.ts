import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Time } from '@sapphire/time-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import { ModerationType } from '@prisma/client';

@ApplyOptions<Command.Options>({
  name: 'ban',
  description: 'ban a member 🔨',
  requiredUserPermissions: [PermissionFlagsBits.BanMembers],
  requiredClientPermissions: [PermissionFlagsBits.BanMembers],
  runIn: 'GUILD_ANY',
})
export class BanCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
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
    const user = interaction.options.getUser('user', true);

    const interactionMember = await interaction.guild?.members.fetch(
      interaction.user.id,
    );

    const member = await interaction.guild?.members.fetch(user.id);

    if (
      interactionMember!.roles.highest <= member!.roles.highest ||
      interaction.guild?.ownerId === user.id
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Error!`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setColor('Blue')
            .setTimestamp()
            .setDescription(
              `You cannot ban ${user} because they either have a higher or equal positioned role than you, or they are the owner of the server!`,
            ),
        ],
        ephemeral: true,
      });
    }

    let reason =
      interaction.options.getString('reason', false) ?? 'No reason provided';
    let evidence =
      interaction.options.getString('evidence', false) ??
      'No evidence provided';
    const days = interaction.options.getInteger('days', false) ?? 0;
    const silent = interaction.options.getBoolean('silent', false) ?? false;

    reason =
      reason.length > 100
        ? (reason = `${reason.substring(0, 100)}...`)
        : reason;

    evidence =
      evidence.length > 100 ? `${evidence.substring(0, 100)}...` : evidence;

    await this.container.moderationManager.handleModeration(
      ModerationType.BAN,
      interaction,
      user,
      reason,
      evidence,
    );

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
              value: `\`${reason}\``,
            },
            {
              name: 'Messages deleted',
              value: `\`${days}\` days of messages deleted`,
            },
            {
              name: 'Evidence',
              value: `\`${evidence}\``,
            },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
      ephemeral: silent,
    });
  }
}
