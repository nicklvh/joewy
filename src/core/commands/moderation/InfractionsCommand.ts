import { Command } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({
  name: 'infractions',
  description: 'show all of a members infractions: warns/bans/mutes/kicks...',
  requiredUserPermissions: [PermissionFlagsBits.ManageMessages],
  runIn: 'GUILD_ANY',
})
export class InfractionsCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => {
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('the user to show infractions for')
              .setRequired(false),
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);
      },
      { idHints: ['1175550972718747740'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const user = interaction.options.getUser('user', false) ?? interaction.user;

    await interaction.reply(user.toString());
  }
}
