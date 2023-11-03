import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { Time } from '@sapphire/time-utilities';

export class BanCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'ban',
      description: 'ban a member 🔨',
      requiredUserPermissions: ['BanMembers'],
      requiredClientPermissions: ['BanMembers'],
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
          .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers);
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
    const days = interaction.options.getInteger('days') ?? 0;
    const silent = interaction.options.getBoolean('silent') ?? false;

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
              name: 'Days',
              value: `\`${days} days of messages deleted\``,
            },
          ]),
      ],
      ephemeral: silent,
    });
  }
}
