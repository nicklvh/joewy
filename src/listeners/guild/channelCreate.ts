import { ChannelTypeNames } from "../../types/index";
import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, type GuildChannel } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.ChannelCreate,
})
export class ChannelCreateListener extends Listener {
  public async run(channel: GuildChannel) {
    this.container.logger.info("ChannelCreateListener");

    const audit_channel = await this.container.client.auditlogChecks(
      channel.guild
    );
    if (!audit_channel) return;

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

    return audit_channel.send({
      embeds: [embed],
    });
  }
}
