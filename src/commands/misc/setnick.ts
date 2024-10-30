import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "setnick",
  description: "set the nickname of a user",
  requiredClientPermissions: [PermissionFlagsBits.ManageNicknames],
  requiredUserPermissions: [PermissionFlagsBits.ManageNicknames],
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class SetNickCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName("user")
              .setDescription("the user to set the nickname of")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("nickname")
              .setDescription("the nickname to set")
              .setRequired(true)
              .setMaxLength(32)
          ),
      { idHints: ["1171942330958360587"] }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    const user = interaction.options.getUser("user", true);
    const nickname = interaction.options.getString("nickname", true);
    const member = await interaction.guild.members.fetch(user.id);
    const oldNickname = member.nickname || member.displayName;

    if (user.id === interaction.guild.ownerId) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "Cannot Set Nickname",
              iconURL: user.avatarURL() || "",
            })
            .addFields([
              {
                name: "Reason",
                value: "Cannot set the nickname of the server owner",
              },
            ])

            .setColor("Blue"),
        ],
      });
    }

    await member.setNickname(nickname);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Nickname Set | ${user.tag}`,
            iconURL: user.avatarURL() || "",
          })
          .addFields([
            {
              name: "Old Nickname",
              value: `\`${oldNickname}\``,
              inline: true,
            },
            {
              name: "New Nickname",
              value: `\`${nickname}\``,
              inline: true,
            },
          ])

          .setColor("Blue"),
      ],
    });
  }
}
