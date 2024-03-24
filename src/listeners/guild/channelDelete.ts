import { ChannelTypeNames } from "../../types/index.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, channelMention, type GuildChannel } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.ChannelDelete,
})
export class ChannelDeleteListener extends Listener {
  public async run(channel: GuildChannel) {
    const auditlogChannel = await this.container.helpers.auditlogChecks(
      channel.guild
    );
    if (!auditlogChannel) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Channel Deleted | ${channel.name}`,
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
