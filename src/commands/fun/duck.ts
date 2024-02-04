import { Command } from "@sapphire/framework";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import type { APIPetInterface } from "#utils";

@ApplyOptions<Command.Options>({
  name: "duck",
  description: "shows a duck 🦆",
})
export class DuckCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const data = await fetch<APIPetInterface>(
      "https://random-d.uk/api/v2/quack",
      FetchResultTypes.JSON
    ).catch((error) => this.container.logger.error(error));

    const embed = new EmbedBuilder();

    if (!data)
      return interaction.reply({
        embeds: [
          embed
            .setAuthor({
              name: "Something went wrong! 🦆",
              iconURL: interaction.user.avatarURL()!,
            })
            .setColor("Red")
            .setDescription(`Couldn't fetch a duck 🦆\nTry again later!`),
        ],
      });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Here's a duck 🦆",
            iconURL: interaction.user.avatarURL()!,
          })
          .setImage(data.url)
          .setColor("Blue")
          .setFooter({ text: data.message! }),
      ],
    });
  }
}
