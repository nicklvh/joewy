import { type ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { EmbedBuilder } from 'discord.js';

interface DuckResponse {
  url: string;
  message: string;
}

export class DuckCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'duck',
      description: 'shows a duck 🦆',
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { idHints: ['1169732840691355659'] },
    );
  }

  public async run(interaction: Command.ChatInputCommandInteraction) {
    const data = await fetch<DuckResponse>(
      'https://random-d.uk/api/v2/quack',
      FetchResultTypes.JSON,
    );

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Here's a duck 🦆",
            iconURL: interaction.user.avatarURL({ extension: 'png' })!,
          })
          .setImage(data.url)
          .setColor('Blue')
          .setFooter({ text: data.message })
          .setTimestamp(),
      ],
    });
  }
}
