import { ApplyOptions } from "@sapphire/decorators";
import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { JoewyEmbed, EconomyManager } from "../../structures";

@ApplyOptions<Command.Options>({
  description: "Withdraw money from your account",
  fullCategory: ["economy"],
})
export class WithdrawCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addIntegerOption((builder) =>
            builder
              .setName("amount")
              .setDescription("The amout of money to withdraw")
              .setRequired(true)
              .setMinValue(10)
              .setMaxValue(100000)
          ),
      { idHints: ["960313421864259644"] }
    );
  }

  public override async chatInputRun(
    interaction: CommandInteraction
  ): Promise<void> {
    const amount: number | null = interaction.options.getInteger("amount");

    const result = await EconomyManager.withdrawCoins(
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
        .setDescription(`You don't have enough coins in your bank!`);

      return interaction.reply({ embeds: [embed] });
    }

    embed
      .setAuthor({
        name: `Withdrawal for ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(
        `Withdrew \`${amount}\` coins from your bank.\n\n**❯ Coins:** \`${await EconomyManager.getBalance(
          interaction.user.id
        )}\`\n**❯ Bank:** \`${await EconomyManager.getBankedBalance(
          interaction.user.id
        )}\``
      )
      .setThumbnail(interaction.user.displayAvatarURL());

    return interaction.reply({ embeds: [embed] });
  }
}
