import { ChannelTypeNames } from "../../types/index.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, type GuildChannel } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.ChannelCreate,
})
export class ChannelCreateListener extends Listener {
  public async run(channel: GuildChannel) {
    const auditlogChannel = await this.container.helpers.auditlogChecks(
      channel.guild
    );
    if (!auditlogChannel) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Channel Created`,
        iconURL: channel.guild.iconURL() || "",
      })
      .addFields([
        {
          name: "Channel Name",
          value: channel.name,
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
