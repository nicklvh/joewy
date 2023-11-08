import { ApplyOptions } from '@sapphire/decorators';
import { type ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'whois',
  description: 'shows information about a user',
})
export class WhoisCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('the user to show information about')
              .setRequired(false),
          ),
      { idHints: [] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const user = interaction.options.getUser('user') ?? interaction.user;

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: `Whois | ${user.tag}` })
          .setColor(user.hexAccentColor ?? 'Blue')
          .setTimestamp()
          .setFooter({ text: `ID: ${user.id}` }),
      ],
    });
  }
}
