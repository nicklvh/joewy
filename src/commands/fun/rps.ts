import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

export class RockPaperScissorsCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "rps",
      description: "will it be: rock, paper, or scissors? 🤔",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName("choice")
              .setDescription("your choice of rock, paper, or scissors")
              .setRequired(true)
              .setChoices(
                {
                  name: "Rock",
                  value: "Rock",
                },
                {
                  name: "Paper",
                  value: "Paper",
                },
                {
                  name: "Scissors",
                  value: "Scissors",
                }
              )
          ),
      { idHints: ["1171945619875696672"] }
    );
  }

  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const random = Math.random();
    const choice = interaction.options.getString("choice", true);
    let result: "win" | "lose" | "tie" = "tie";
    const myChoice: "Rock" | "Paper" | "Scissors" =
      random > 0.66 ? "Rock" : random > 0.33 ? "Paper" : "Scissors";

    if (myChoice === choice) result = "tie";
    if (myChoice === "Rock" && choice === "Paper") result = "win";
    if (myChoice === "Rock" && choice === "Scissors") result = "lose";
    if (myChoice === "Paper" && choice === "Scissors") result = "win";
    if (myChoice === "Paper" && choice === "Rock") result = "lose";
    if (myChoice === "Scissors" && choice === "Rock") result = "win";
    if (myChoice === "Scissors" && choice === "Paper") result = "lose";

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Rock, Paper, Scissors! 🤔",
            iconURL: interaction.user.avatarURL()!,
          })
          .addFields([
            { name: "You picked", value: `\`${choice}\``, inline: true },
            { name: "I picked", value: `\`${myChoice}\``, inline: true },
            {
              name: "Result",
              value: `\`${
                result === "win"
                  ? "You won!"
                  : result === "lose"
                    ? "You lost!"
                    : "We tied!"
              }\``,
            },
          ])
          .setColor("Blue"),
      ],
    });
  }
}
