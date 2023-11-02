import { type ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { EmbedBuilder } from 'discord.js';

type CatResponse = Array<CatObject>;

interface CatObject {
  url: string;
}

export class CatCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'cat',
      description: 'shows a cat 😽',
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { idHints: ['1169746949239476275'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const data = await fetch<CatResponse>(
      'https://api.thecatapi.com/v1/images/search',
      FetchResultTypes.JSON,
    );

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Here's a cat 😽",
            iconURL: interaction.user.avatarURL({ extension: 'png' })!,
          })
          .setImage(data[0].url)
          .setColor('Blue')
          .setFooter({ text: 'Powered by thecatapi.com' })
          .setTimestamp(),
      ],
    });
  }
}
