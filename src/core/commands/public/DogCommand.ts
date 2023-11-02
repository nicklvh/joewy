import { type ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { EmbedBuilder } from 'discord.js';

type DogResponse = Array<DogObject>;

interface DogObject {
  url: string;
}

export class DogCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'dog',
      description: 'shows a dog 🐶',
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { idHints: ['1169750644710703225'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const data = await fetch<DogResponse>(
      'https://api.thedogapi.com/v1/images/search',
      FetchResultTypes.JSON,
    );

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Here's a dog 🐶",
            iconURL: interaction.user.avatarURL({ extension: 'png' })!,
          })
          .setImage(data[0].url)
          .setColor('Blue')
          .setFooter({ text: 'Powered by thedogapi.com' })
          .setTimestamp(),
      ],
    });
  }
}
