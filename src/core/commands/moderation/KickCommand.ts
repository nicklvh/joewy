import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { ModerationType } from '@prisma/client';

@ApplyOptions<Command.Options>({
  name: 'kick',
  description: 'kick a member 🔨',
  requiredUserPermissions: [PermissionFlagsBits.KickMembers],
  requiredClientPermissions: [PermissionFlagsBits.KickMembers],
  runIn: 'GUILD_ANY',
})
export class KickCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => {
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('the user to kick')
              .setRequired(true),
          )
          .addStringOption((option) =>
            option
              .setName('reason')
              .setDescription('the reason for the kick')
              .setRequired(false),
          )
          .addStringOption((option) =>
            option
              .setName('evidence')
              .setDescription('evidence for the kick')
              .setRequired(false),
          )
          .addBooleanOption((option) =>
            option
              .setName('silent')
              .setDescription('whether to send the kick message silently')
              .setRequired(false),
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);
      },
      { idHints: ['1175535354334421063'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const user = interaction.options.getUser('user', true);
    let reason =
      interaction.options.getString('reason', false) ?? 'No reason provided';
    let evidence =
      interaction.options.getString('evidence', false) ??
      'No evidence provided';
    const silent = interaction.options.getBoolean('silent', false) ?? false;
    const member = await interaction.guild!.members.fetch(user.id);

    reason =
      reason.length > 100
        ? (reason = `${reason.substring(0, 100)}...`)
        : reason;

    evidence =
      evidence.length > 100 ? `${evidence.substring(0, 100)}...` : evidence;

    await this.container.moderationManager.handleModeration(
      ModerationType.KICK,
      interaction,
      user,
      reason,
      evidence,
    );

    await member.kick(reason);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Kicked ${user.tag}`,
            iconURL: user.displayAvatarURL(),
          })
          .addFields([
            {
              name: 'Reason',
              value: `\`${reason}\``,
              inline: true,
            },
            {
              name: 'Evidence',
              value: `\`${evidence}\``,
              inline: true,
            },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
      ephemeral: silent,
    });
  }
}
