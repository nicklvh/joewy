import { Command } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { JoewyEmbed } from "../../structures/JoewyEmbed";

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: "Pong! Show the discord latency.",
      fullCategory: ["general"],
      chatInputCommand: {
        register: true,
        idHints: ["959925756862021702"],
      },
    });
  }

  public override chatInputRun(interaction: CommandInteraction): Promise<void> {
    const embed: JoewyEmbed = new JoewyEmbed(false).setDescription(
      `Pong! Latency is \`${this.container.client.ws.ping}ms\``
    );

    return interaction.reply({ embeds: [embed] });
  }
}
