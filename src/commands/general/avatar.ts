import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import type { CommandInteraction, User } from "discord.js";
import { JoewyEmbed } from "../../structures/JoewyEmbed";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  description: "Get the avatar of a user.",
  fullCategory: ["general"],
})
export class AvatarCommand extends Command {
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
              .setRequired(false)
              .setDescription("The user to get the avatar of")
          )
          .addIntegerOption((builder) =>
            builder
              .setChoices([
                ["128", 128],
                ["256", 256],
                ["512", 512],
                ["1024", 1024],
                ["2048", 2048],
                ["4096", 4096],
              ])
              .setName("size")
              .setDescription("The size of the picture")
              .setRequired(false)
          )
          .addStringOption((builder) =>
            builder
              .setName("format")
              .setChoices([
                ["png", "png"],
                ["jpg", "jpg"],
                ["jpeg", "jpeg"],
              ])
              .setDescription("The format of the picture")
          ),
      { idHints: ["959947405808267315"] }
    );
  }

  public override async chatInputRun(
    interaction: CommandInteraction
  ): Promise<void> {
    const user: User = interaction.options.getUser("user") || interaction.user;
    const format: any = interaction.options.getString("format") || "png";
    const size: any = interaction.options.getInteger("size") || 1024;

    const embed: JoewyEmbed = new JoewyEmbed()
      .setImage(user.displayAvatarURL({ size, format }))
      .setTitle(`${user.tag}'s avatar`);

    return interaction.reply({ embeds: [embed] });
  }
}
