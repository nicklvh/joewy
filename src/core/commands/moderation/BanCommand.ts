import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';
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
          .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers);
      },
      { idHints: ['1169766210443956264'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const user = interaction.options.getUser('user')!;
    const reason = interaction.options.getString('reason')!;
    const days = interaction.options.getInteger('days')!;

    await interaction.guild?.bans.create(user, {
      reason,
      deleteMessageSeconds: days * (Time.Day / 1000),
    });

    return interaction.reply({
      content: `banned ${user.tag} 🔨`,
      ephemeral: true,
    });
  }
}
