import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import type {
  CommandInteraction,
  GuildMember,
  Message,
  TextChannel,
  User,
} from "discord.js";
import type { Guild } from "@prisma/client";
import { JoewyEmbed } from "../../structures/JoewyEmbed";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  description: "Kick a user from the server",
  requiredClientPermissions: ["KICK_MEMBERS"],
  requiredUserPermissions: ["KICK_MEMBERS"],
  fullCategory: ["moderation"],
  runIn: "GUILD_ANY",
})
export class KickCommand extends Command {
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
              .setDescription("The user to kick")
              .setRequired(true)
          )
          .addStringOption((builder) =>
            builder
              .setName("reason")
              .setDescription("The reason for the kick")
              .setRequired(false)
          ),
      { idHints: ["960533274697011261"] }
    );
  }

  public override async chatInputRun(
    interaction: CommandInteraction
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  ): Promise<void | Message<boolean>> {
    const user: User = interaction.options.getUser("user")!;
    const reason: string =
      interaction.options.getString("reason") || "No reason provided";

    const embed: JoewyEmbed = new JoewyEmbed(true)
      .setAuthor({
        name: `🔨 ${user.tag} kicked`,
        iconURL: user.displayAvatarURL(),
      })
      .setThumbnail(user.displayAvatarURL({ size: 1024 }))
      .setDescription(
        `🔨 You have kicked \`${user.tag}\` from the server for *${reason}*.`
      );

    await interaction.reply({ embeds: [embed] });

    const userEmbed: JoewyEmbed = new JoewyEmbed(true)
      .setAuthor({
        name: `🔨 ${user.tag} kicked`,
        iconURL: user.displayAvatarURL(),
      })
      .setThumbnail(user.displayAvatarURL({ size: 1024 }))
      .setDescription(
        `🔨 You have been kicked from \`${
          interaction.guild!.name
        }\` for *${reason}*`
      );

    await user.send({ embeds: [userEmbed] }).catch();

    await interaction
      .guild!.members.fetch(user.id)
      .then((member: GuildMember): Promise<GuildMember> => member.kick(reason));

    const guild: Guild | null = await this.container.database.guild.findUnique({
      where: { id: interaction.guild!.id },
    });

    if (!guild) return;

    const channel: TextChannel = (await interaction.guild!.channels.fetch(
      guild.modlog!
    )) as TextChannel;

    if (!channel) return;

    const modlogEmbed: JoewyEmbed = new JoewyEmbed(true)
      .setAuthor({
        name: `🔨 ${user.tag} kicked`,
        iconURL: user.displayAvatarURL(),
      })
      .setDescription(
        `**❯ Member:** \`${user.tag}\` (${user.id})\`\n**❯ Reason:** *${reason}*\n**❯ Moderator:** \`${interaction.user.tag}\` (\`${interaction.user.id}\`)`
      );

    return channel.send({ embeds: [modlogEmbed] });
  }
}
