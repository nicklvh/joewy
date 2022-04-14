import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { JoewyEmbed, EconomyManager } from "../../structures";
import type { CommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
@ApplyOptions<Command.Options>({
  description: "Deposit money into your account",
  fullCategory: ["economy"],
})
export class DepositCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addIntegerOption((builder) =>
            builder
              .setName("amount")
              .setDescription("The amount of money to deposit")
              .setRequired(true)
              .setMinValue(10)
              .setMaxValue(100000)
          ),
      { idHints: ["960311633681461248"] }
    );
  }

  public override async chatInputRun(
    interaction: CommandInteraction
  ): Promise<void> {
    const amount: number | null = interaction.options.getInteger("amount");

    const result = await EconomyManager.depositCoins(
      interaction.user.id,
      amount!
    );

    const embed: JoewyEmbed = new JoewyEmbed(true);

    if (!result) {
      embed
        .setAuthor({
          name: "Oops...",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`You don't have enough coins!`);

      return interaction.reply({ embeds: [embed] });
    }

    embed
      .setAuthor({
        name: `Deposit for ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(
        `Deposited \`${amount}\` coins into your bank.\n\n**❯ Coins:** \`${await EconomyManager.getBalance(
          interaction.user.id
        )}\`\n**❯ Bank:** \`${await EconomyManager.getBankedBalance(
          interaction.user.id
        )}\``
      );

    return interaction.reply({ embeds: [embed] });
  }
}
