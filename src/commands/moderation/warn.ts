import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import type { CommandInteraction, TextChannel } from "discord.js";
import { JoewyEmbed } from "../../structures";

@ApplyOptions<Command.Options>({
  requiredUserPermissions: ["MANAGE_MESSAGES"],
  description: "Warn a user",
  runIn: ["GUILD_ANY"],
  fullCategory: ["moderation"],
})
export class WarnCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((builder) =>
            builder
              .setName("user")
              .setDescription("User to warn")
              .setRequired(true)
          )
          .addStringOption((builder) =>
            builder
              .setName("reason")
              .setDescription("The reason of the warning")
              .setRequired(false)
          ),
      { idHints: ["963857418268336159"] }
    );
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    const user = interaction.options.getUser("user")!;
    let reason = interaction.options.getString("reason");

    if (!reason) reason = "No reason given";

    // @ts-expect-error Saying a guild is required, but runIn is GUILD_ANY
    const member = await interaction.channel!.guild.members.fetch(user!.id);
    if (!member) {
      await interaction.reply("User not found");
      return;
    }

    await this.container.database.warns.create({
      data: {
        userid: user!.id,
        guildid: interaction.guild!.id,
        modid: interaction.user.id,
        time: new Date(),
        reason,
      },
    });

    const embed: JoewyEmbed = new JoewyEmbed(true)
      .setTitle(`Warned ${user.tag}`)
      .setDescription(`Reason: *${reason}*`)
      .setThumbnail(user.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });

    const guild = await this.container.database.guild.findUnique({
      where: { id: interaction.guild!.id },
    });

    if (!guild) {
      await this.container.database.guild.create({
        data: { id: interaction.guild!.id },
      });

      return;
    }

    const userEmbed: JoewyEmbed = new JoewyEmbed()
      .setTitle(`🔨 ${user.tag} warned`)
      .setThumbnail(user.displayAvatarURL({ size: 1024 }))
      .setDescription(
        `🔨 You have been warned in \`${
          interaction.guild!.name
        }\` for *${reason}*`
      );

    await user.send({ embeds: [userEmbed] }).catch();

    if (!guild.modlog) return;

    const modlog = interaction.guild!.channels.fetch(
      guild.modlog
    ) as unknown as TextChannel;

    if (!modlog) return;

    const modlogEmbed: JoewyEmbed = new JoewyEmbed(true)
      .setTitle(`🔨 ${user.tag} warned`)
      .setDescription(
        `❯ Member: \`${user.tag}\` (${user.id})\`\n❯ Reason: *${reason}*\n❯ Moderator: \`${interaction.user.tag}\` (\`${interaction.user.id}\`)`
      );

    await modlog.send({ embeds: [modlogEmbed] });
  }
}
