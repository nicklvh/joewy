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

    const embed: JoewyEmbed = new JoewyEmbed();

    if (!result) {
      embed
        .setTitle("Oops...")
        .setDescription(`You don't have enough coins in your bank!`);

      return interaction.reply({ embeds: [embed] });
    }

    embed
      .setTitle(`Withdraw for ${interaction.user.tag}`)
      .setDescription(
        `Withdrew \`${amount}\` coins from your bank.\n\nYou now have \`${await EconomyManager.getBalance(
          interaction.user.id
        )}\` coins\nBanked Balance: \`${await EconomyManager.getBankedBalance(
          interaction.user.id
        )}\``
      )
      .setThumbnail(interaction.user.displayAvatarURL());

    return interaction.reply({ embeds: [embed] });
  }
}
