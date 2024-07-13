import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

export class CoinflipCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "coinflip",
      description: "flip! shows heads or tails 🪙",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { idHints: ["1171942952705208390"] }
    );
  }

  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Flip! 🪙",
            iconURL: interaction.user.avatarURL()!,
          })
          .addFields([
            {
              name: "Result",
              value: `\`${Math.random() > 0.5 ? "Heads" : "Tails"}\``,
            },
          ])
          .setColor("Blue"),
      ],
    });
  }
}
