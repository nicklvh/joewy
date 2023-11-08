import { type ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { EmbedBuilder } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { APIPetInterface } from '@lib/index';

@ApplyOptions<Command.Options>({
  name: 'duck',
  description: 'shows a duck 🦆',
})
export class DuckCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { idHints: ['1169732840691355659'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const data = await fetch<APIPetInterface>(
      'https://random-d.uk/api/v2/quack',
      FetchResultTypes.JSON,
    );

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Here's a duck 🦆",
            iconURL: interaction.user.avatarURL()!,
          })
          .setImage(data.url)
          .setColor('Blue')
          .setFooter({ text: data.message! })
          .setTimestamp(),
      ],
    });
  }
}
