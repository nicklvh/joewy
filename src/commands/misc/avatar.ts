import { Command } from "@sapphire/framework";
import { EmbedBuilder, type ImageExtension, type ImageSize } from "discord.js";

export class AvatarCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "avatar",
      description: "shows a user's avatar",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName("user")
              .setDescription("the user to show the avatar of")
              .setRequired(false)
          )
          .addNumberOption((option) =>
            option
              .setName("size")
              .setDescription("the size of the avatar")
              .setRequired(false)
              .setChoices(
                { name: "16", value: 16 },
                { name: "32", value: 32 },
                { name: "64", value: 64 },
                { name: "128", value: 128 },
                { name: "256", value: 256 },
                { name: "512", value: 512 },
                { name: "1024", value: 1024 },
                { name: "2048", value: 2048 },
                { name: "4096", value: 4096 }
              )
          )
          .addStringOption((option) =>
            option
              .setName("format")
              .setDescription("the format of the avatar")
              .setRequired(false)
              .setChoices(
                { name: "webp", value: "webp" },
                { name: "png", value: "png" },
                { name: "jpg", value: "jpg" },
                { name: "jpeg", value: "jpeg" },
                { name: "gif", value: "gif" }
              )
          ),
      { idHints: ["1171494645918875718"] }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const user = interaction.options.getUser("user", false) ?? interaction.user;
    const size = interaction.options.getNumber("size", false) ?? 1024;
    const format = interaction.options.getString("format", false) ?? "png";

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${user.username}'s avatar`,
            iconURL: user.avatarURL() || undefined,
          })
          .setColor("Blue")
          .setImage(
            user.avatarURL({
              size: size as ImageSize,
              extension: format as ImageExtension,
            })
          ),
      ],
    });
  }
}
