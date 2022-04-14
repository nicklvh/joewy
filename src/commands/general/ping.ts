import { Command } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { JoewyEmbed } from "../../structures/JoewyEmbed";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  description: "Pong! Show the discord latency.",
  fullCategory: ["general"],
  chatInputCommand: {
    register: true,
    idHints: ["959925756862021702"],
  },
})
export class PingCommand extends Command {
  public override chatInputRun(interaction: CommandInteraction): Promise<void> {
    const embed: JoewyEmbed = new JoewyEmbed().setDescription(
      `Pong! Latency is \`${this.container.client.ws.ping}ms\``
    );

    return interaction.reply({ embeds: [embed] });
  }
}
