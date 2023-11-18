import { Command } from '@sapphire/framework';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { EmbedBuilder } from 'discord.js';
import { APIPetResponse } from '@lib/index';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({
  name: 'dog',
  description: 'shows a dog 🐶',
})
export class DogCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { idHints: ['1169750644710703225'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const data = await fetch<APIPetResponse>(
      'https://api.thedogapi.com/v1/images/search',
      FetchResultTypes.JSON,
    ).catch((error) => this.container.logger.error(error));

    const embed = new EmbedBuilder();

    if (!data)
      return interaction.reply({
        embeds: [
          embed
            .setAuthor({
              name: 'Something went wrong! 🐶',
              iconURL: interaction.user.avatarURL()!,
            })
            .setColor('Red')
            .setDescription(`Couldn't fetch a dog 🐶\nTry again later!`)
            .setTimestamp(),
        ],
      });

    return interaction.reply({
      embeds: [
        embed
          .setAuthor({
            name: "Here's a dog 🐶",
            iconURL: interaction.user.avatarURL()!,
          })
          .setImage(data[0].url)
          .setColor('Blue')
          .setFooter({ text: 'Powered by thedogapi.com' })
          .setTimestamp(),
      ],
    });
  }
}
