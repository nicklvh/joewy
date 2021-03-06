import { ApplyOptions } from "@sapphire/decorators";
import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import type { CommandInteraction, User } from "discord.js";
import { JoewyEmbed, EconomyManager } from "../../structures";

@ApplyOptions<Command.Options>({
  description: "Check yours or somebody else's balance.",
  fullCategory: ["economy"],
})
export class BalanceCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((builder) =>
            builder
              .setName("user")
              .setDescription("The user to check the balance of")
              .setRequired(false)
          ),
      { idHints: ["960290448121925763"] }
    );
  }

  public override async chatInputRun(
    interaction: CommandInteraction
  ): Promise<void> {
    const user: User | null =
      interaction.options.getUser("user") || interaction.user;

    const balance: number = await EconomyManager.getBalance(user.id);

    const embed: JoewyEmbed = new JoewyEmbed(true)
      .setAuthor({
        name: `Balance for ${user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(
        `**❯ Coins:** \`${balance}\`\n**❯ Bank:** \`${await EconomyManager.getBankedBalance(
          user.id
        )}\``
      );

    return interaction.reply({ embeds: [embed] });
  }
}
