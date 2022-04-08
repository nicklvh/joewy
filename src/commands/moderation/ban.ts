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

export class BanCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: "Ban a user from the server",
      requiredClientPermissions: ["BAN_MEMBERS"],
      requiredUserPermissions: ["BAN_MEMBERS"],
      fullCategory: ["moderation"],
      runIn: "GUILD_ANY",
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
          .addUserOption((builder) =>
            builder
              .setName("user")
              .setDescription("The user to ban")
              .setRequired(true)
          )
          .addStringOption((builder) =>
            builder
              .setName("reason")
              .setDescription("The reason for the ban")
              .setRequired(false)
          ),
      { idHints: ["960134829033287700"] }
    );
  }

  public override async chatInputRun(
    interaction: CommandInteraction
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  ): Promise<void | Message<boolean>> {
    const user: User = interaction.options.getUser("user")!;
    const reason: string =
      interaction.options.getString("reason") || "No reason provided";

    if (!user) return;

    await this.container.database.bans.create({
      data: {
        userid: user.id,
        modid: interaction.user.id,
        reason,
        timed: false,
        guildid: interaction.guild!.id,
      },
    });

    const embed: JoewyEmbed = new JoewyEmbed()
      .setTitle(`🔨 ${user.tag} banned`)
      .setThumbnail(user.displayAvatarURL({ size: 1024 }))
      .setDescription(
        `🔨 You have banned \`${user.tag}\` from the server for *${reason}*.`
      );

    await interaction.reply({ embeds: [embed] });

    const userEmbed: JoewyEmbed = new JoewyEmbed()
      .setTitle(`🔨 ${user.tag} banned`)
      .setThumbnail(user.displayAvatarURL({ size: 1024 }))
      .setDescription(
        `🔨 You have been banned from \`${
          interaction.guild!.name
        }\` for *${reason}*`
      );

    await user.send({ embeds: [userEmbed] }).catch();

    await interaction
      .guild!.members.fetch(user.id)
      .then(
        (member: GuildMember): Promise<GuildMember> => member.ban({ reason })
      );

    const guild: Guild | null = await this.container.database.guild.findUnique({
      where: { id: interaction.guild!.id },
    });

    if (!guild) return;

    const channel: TextChannel = (await interaction.guild!.channels.fetch(
      guild.modlog!
    )) as TextChannel;

    if (!channel) return;

    const modLogEmbed: JoewyEmbed = new JoewyEmbed()
      .setTitle(`🔨 ${user.tag} banned`)
      .setThumbnail(user.displayAvatarURL({ size: 1024 }))
      .setDescription(
        `🔨 \`${interaction.user.tag}\` banned \`${user.tag}\` for *${reason}*.`
      );

    return channel.send({ embeds: [modLogEmbed] });
  }
}
