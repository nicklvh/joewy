import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "coinflip",
  description: "flip! shows heads or tails",
})
export class CoinflipCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
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
