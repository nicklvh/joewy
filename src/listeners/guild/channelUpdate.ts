import { ChannelTypeNames, logChecks, LoggingTypes } from "../../utils";
import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, channelMention, type GuildChannel } from "discord.js";

export class ChannelUpdateListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.ChannelUpdate,
    });
  }

  public async run(channel: GuildChannel) {
    const auditlogChannel = await logChecks(
      channel.guild,
      LoggingTypes.AUDITLOG
    );
    if (!auditlogChannel) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Channel Updated | ${channel.name}`,
        iconURL: channel.guild.iconURL() || "",
      })
      .addFields([
        {
          name: "Channel",
          value: channelMention(channel.id),
          inline: true,
        },
        {
          name: "Channel Type",
          value: `\`${ChannelTypeNames[channel.type]}\``,
          inline: true,
        },
        {
          name: "Channel ID",
          value: `\`${channel.id}\``,
          inline: true,
        },
      ])
      .setColor("Blue");

    return auditlogChannel.send({
      embeds: [embed],
    });
  }
}
