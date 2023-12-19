import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ChannelType,
  EmbedBuilder,
  TimestampStyles,
  bold,
  inlineCode,
  time,
} from "discord.js";

@ApplyOptions<Command.Options>({
  name: "serverinfo",
  description: "shows information about the server",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class ServerInfoCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    const roles = interaction.guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString());

    const members = interaction.guild.members.cache;
    const channels = interaction.guild.channels.cache;
    const emojis = interaction.guild.emojis.cache;
    const owner = await interaction.guild.fetchOwner();
    const premiumTier = interaction.guild.premiumTier
      ? `Tier ${interaction.guild.premiumTier}`
      : "None";

    const generalContent = [
      `${bold("❯ Name:")} ${inlineCode(interaction.guild.name)}`,
      `${bold("❯ ID:")} ${inlineCode(interaction.guildId)}`,
      `${bold("❯ Owner:")} ${inlineCode(owner!.user.tag)} (${inlineCode(
        interaction.guild.ownerId
      )})`,
      `${bold("❯ Boost Tier:")} ${inlineCode(premiumTier)}`,
      `${bold("❯ Time Created:")} ${time(
        Math.floor(interaction.guild.createdTimestamp) / 1000,
        TimestampStyles.ShortDateTime
      )}`,
    ];

    const statisticsContent = [
      `${bold("❯ Role Count:")} ${inlineCode(`${roles.length}`)}`,
      `${bold("❯ Emoji Count:")} ${inlineCode(`${emojis.size}`)}`,
      `${bold("❯ Regular Emoji Count:")} ${inlineCode(
        `${emojis.filter((emoji) => !emoji.animated).size}`
      )}`,
      `${bold("❯ Animated Emoji Count:")} ${inlineCode(
        `${emojis.filter((emoji) => emoji.animated).size}`
      )}`,
      `${bold("❯ Member Count:")} ${inlineCode(
        `${interaction.guild.memberCount}`
      )}`,
      `${bold("❯ Humans:")} ${inlineCode(
        `${members.filter((member) => !member.user.bot).size}`
      )}`,
      `${bold("❯ Bots:")} ${inlineCode(
        `${members.filter((member) => member.user.bot).size}`
      )}`,
      `${bold("❯ Text Channels:")} ${inlineCode(
        `${
          channels.filter((channel) => channel.type === ChannelType.GuildText)
            .size
        }`
      )}`,
      `${bold("❯ Voice Channels:")} ${inlineCode(
        `${
          channels.filter((channel) => channel.type === ChannelType.GuildVoice)
            .size
        }`
      )}`,
      `${bold("❯ Boost Count:")} ${inlineCode(
        `${interaction.guild.premiumSubscriptionCount || "0"}`
      )}}`,
    ];

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Server Info | ${interaction.guild.name}`,
            iconURL: interaction.guild.iconURL() || "",
          })
          .setColor("Blue")
          .addFields([
            {
              name: "General",
              value: generalContent.join("\n"),
              inline: true,
            },
            {
              name: "Statistics",
              value: statisticsContent.join("\n"),
              inline: true,
            },
          ])
          .setFooter({ text: `ID: ${interaction.guild.id}` }),
      ],
    });
  }
}
