import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import type { CommandInteraction } from "discord.js";
import { readFile } from "fs/promises";
import { JoewyEmbed, EconomyManager } from "../../structures";

@ApplyOptions<Command.Options>({
  description: "Work for some coins.",
  chatInputCommand: {
    register: true,
    idHints: ["960239802475749457"],
  },
  cooldownDelay: Time.Minute * 15,
  fullCategory: ["economy"],
})
export class WorkCommand extends Command {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): Promise<void> {
    const coins: number =
      Math.floor(Math.random() * 30) + Math.floor(Math.random() * 5) + 1;

    const raw: string = await readFile(
      `${process.cwd()}/assets/jobs.json`,
      "utf-8"
    );

    const jobs: string[] = JSON.parse(raw);

    const job: string = jobs[Math.floor(Math.random() * jobs.length)];

    await EconomyManager.addCoins(interaction.user.id, coins);

    const embed: JoewyEmbed = new JoewyEmbed(true)
      .setAuthor({
        name: "Tiring...",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(
        `💰 You worked as a \`${job}\` and earned ${coins} coins!\n\n**❯ Coins:** ${await EconomyManager.getBalance(
          interaction.user.id
        )}\n**❯ Bank:** ${await EconomyManager.getBankedBalance(
          interaction.user.id
        )}`
      );

    return interaction.reply({ embeds: [embed] });
  }
}
