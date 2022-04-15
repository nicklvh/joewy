import { Command } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { readFile } from "fs/promises";
import { JoewyEmbed } from "../../structures";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  description: "Shows a cute dog",
  fullCategory: ["fun"],
  chatInputCommand: {
    register: true,
    idHints: ["960537869846458408"],
  },
})
export class DogCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const raw: string = await readFile(
      `${process.cwd()}/assets/dogs.json`,
      "utf-8"
    );

    const subreddits: string[] = JSON.parse(raw);
    const subreddit: string =
      subreddits[Math.floor(Math.random() * subreddits.length)];

    const { children } = await fetch(
      `https://reddit.com/r/${subreddit}/hot.json`,
      FetchResultTypes.JSON
    ).then((body: any) => body.data);

    if (!children)
      return interaction.reply({
        embeds: [
          new JoewyEmbed(false)
            .setAuthor({
              name: "Oops...",
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription("Something went wrong! Try again later"),
        ],
      });

    const selected: any =
      children[Math.floor(Math.random() * children.length)].data!;

    const embed: JoewyEmbed = new JoewyEmbed(true)
      .setAuthor({
        name: `📷 ${selected.title}`,
      })
      .setImage(selected.url ? selected.url : selected.thumbnail)
      .setFooter({
        text: `Provided to you by r/${selected.subreddit} | 👍 ${selected.ups} 👎 ${selected.downs}`,
      });

    return interaction.reply({ embeds: [embed] }).catch(() => {
      return interaction.reply({
        embeds: [
          new JoewyEmbed(false)
            .setAuthor({
              name: "Oops...",
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription("Something went wrong! Try again later"),
        ],
      });
    });
  }
}
