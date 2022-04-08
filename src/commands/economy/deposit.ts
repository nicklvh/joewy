import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { JoewyEmbed, EconomyManager } from "../../structures";
import type { CommandInteraction } from "discord.js";

export class DepositCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: "Deposit money into your account",
      fullCategory: ["economy"],
    });
  }

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

    const embed: JoewyEmbed = new JoewyEmbed();

    if (!result) {
      embed.setTitle("Oops...").setDescription(`You don't have enough coins!`);

      return interaction.reply({ embeds: [embed] });
    }

    embed
      .setTitle(`Deposit for ${interaction.user.tag}`)
      .setDescription(
        `Deposited \`${amount}\` coins into your bank.\n\nYou now have \`${await EconomyManager.getBalance(
          interaction.user.id
        )}\` coins\nBanked Balance: \`${await EconomyManager.getBankedBalance(
          interaction.user.id
        )}\``
      )
      .setThumbnail(interaction.user.displayAvatarURL());

    return interaction.reply({ embeds: [embed] });
  }
}
