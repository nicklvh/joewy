import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, type Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { LoggingTypes } from "../../types/types";
import logChecks from "../../lib/helpers/logChecks";

@ApplyOptions<Listener.Options>({
  event: Events.MessageDelete,
})
export class MessageDeleteListener extends Listener {
  public async run(message: Message<true>) {
    const channel = await logChecks(message.guild, LoggingTypes.AUDITLOG);
    if (!channel) return;

    if (message.author.bot) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Message Deleted | ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .addFields([
        {
          name: "Message Content",
          value: message.content,
          inline: true,
        },
      ])
      .setColor("Blue");

    return channel.send({
      embeds: [embed],
    });
  }
}
